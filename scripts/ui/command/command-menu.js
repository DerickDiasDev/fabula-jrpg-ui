import { openItemActionMenu } from "../menus/action-menu.js";

import { createHudCursor } from "../shared/hud-cursor.js";

import { PLAYER_COMMANDS, NPC_COMMANDS } from "./command-list.js";

import { NPC_COMMAND_HANDLERS } from "./npc-commands.js";

import { isNpcCommandActor } from "./npc-actor.js";

import { createCommandRenderer } from "../theme/command-renderer.js";

import { getCurrentTheme } from "../theme/theme-manager.js";

import {
  executeGuard,
  executeHinder,
  executeObjective,
  executeEquipment,
} from "../actions/simple-actions.js";

import { executeStudy } from "../actions/study-action.js";

import { getActiveSubmenu } from "../menus/menu-utils.js";

import { playUISound } from "../shared/audio.js";

// =====================================================
// SELECTED ACTOR
// =====================================================

let selectedActor = null;

// Controle dos botões do Command, criado em setupCommandMenu.
let commandMenuController = null;

// =====================================================
// COMMAND SETS
// =====================================================
//
// O conjunto de comandos depende do Actor do Command:
// NPCs (exceto companions) usam o Command de NPC, que é
// exclusivo do GM; os demais usam o Command de personagem.
// =====================================================

function getCommandSetId(actor) {
  return isNpcCommandActor(actor) ? "npc" : "player";
}

function getCommandSet(setId) {
  if (setId === "npc") {
    return { commands: NPC_COMMANDS, handlers: NPC_COMMAND_HANDLERS };
  }

  return { commands: PLAYER_COMMANDS, handlers: PLAYER_COMMAND_HANDLERS };
}

// Jogadores não veem o Command de NPC; o Command volta
// quando selecionam um personagem.
function updateCommandAvailability(commandMenu, setId) {
  const restricted = setId === "npc" && !game.user.isGM;

  commandMenu
    .closest(".fui-command-wrapper")
    ?.classList.toggle("fui-command-restricted", restricted);
}

// =====================================================
// SET / GET SELECTED ACTOR
// =====================================================

export function updateCommandActor(actor, ui) {
  const commandMenu = ui?.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  selectedActor = actor ?? null;

  commandMenu.dataset.actorName = selectedActor?.name ?? "";

  const setId = getCommandSetId(selectedActor);

  if (commandMenu.dataset.commandSet !== setId) {
    commandMenu.dataset.commandSet = setId;

    commandMenuController?.setCommands(getCommandSet(setId).commands);
  }

  updateCommandAvailability(commandMenu, setId);

  commandMenuController?.refreshCursor();
}

export function getCommandActor() {
  return selectedActor;
}

// =====================================================
// CLEAR SELECTED ACTOR
// =====================================================

export function clearCommandActor(ui) {
  updateCommandActor(null, ui);
}

// =====================================================
// COMMAND HELPERS
// =====================================================

function getCommandFromButton(button) {
  return button?.dataset.command ?? null;
}

function canControlActor(actor) {
  if (game.user.isGM) {
    return true;
  }

  // O Command de NPC é exclusivo do GM.
  if (isNpcCommandActor(actor)) {
    return false;
  }

  return actor.testUserPermission(game.user, "OWNER");
}

function getActorOrWarn() {
  if (!selectedActor) {
    foundry.ui.notifications.warn("Nenhum personagem selecionado.");

    console.warn("Fabula JRPG UI | Command Menu: nenhum Actor selecionado.");

    return null;
  }

  if (!canControlActor(selectedActor)) {
    foundry.ui.notifications.warn("Você não controla este personagem.");

    return null;
  }

  return selectedActor;
}

// =====================================================
// ATTACK
// =====================================================

function executeAttack(actor, ui) {
  openItemActionMenu({
    actor,
    ui,
    itemTypes: ["weapon", "customWeapon"],
    actionType: "attack",
    emptyMessage: "Nenhuma arma disponível.",
  });
}

// =====================================================
// SKILL
// =====================================================

function executeSkill(actor, ui) {
  openItemActionMenu({
    actor,
    ui,
    itemTypes: ["spell"],
    actionType: "skill",
    emptyMessage: "Nenhuma Skill disponível.",
  });
}

// =====================================================
// ITEM
// =====================================================

function executeItem(actor, ui) {
  openItemActionMenu({
    actor,
    ui,
    itemTypes: ["consumable"],
    actionType: "item",
    emptyMessage: "Nenhum Item disponível.",
  });
}

// =====================================================
// COMMAND HANDLERS
// =====================================================

const PLAYER_COMMAND_HANDLERS = {
  attack: executeAttack,
  skill: executeSkill,
  item: executeItem,
  guard: executeGuard,
  hinder: executeHinder,
  objective: executeObjective,
  study: executeStudy,
  equipment: executeEquipment,
};

// =====================================================
// EXECUTE COMMAND
// =====================================================

function executeCommand(ui, selectedIndex, buttons) {
  const activeSubmenu = getActiveSubmenu(ui);

  if (activeSubmenu) {
    return;
  }

  const button = buttons[selectedIndex];

  if (!button) {
    return;
  }

  const command = getCommandFromButton(button);

  if (!command) {
    return;
  }

  const { handlers } = getCommandSet(getCommandSetId(selectedActor));

  const handler = handlers[command];

  if (!handler) {
    console.warn(`Fabula JRPG UI | Command desconhecido: ${command}`);
    return;
  }

  const actor = getActorOrWarn();

  if (!actor) {
    return;
  }

  handler(actor, ui);
}

// =====================================================
// SETUP COMMAND MENU
// =====================================================

export function setupCommandMenu(ui) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  // Os botões são consultados a cada evento (delegação no
  // .fui-command), para que o conjunto de comandos possa ser
  // trocado sem reconfigurar os listeners.
  function getButtons() {
    return Array.from(commandMenu.querySelectorAll(".fui-command-button"));
  }

  const tooltip = ui.querySelector(".fui-command-tooltip");

  const cursor = createHudCursor(commandMenu);

  const commandRenderer = createCommandRenderer(getCurrentTheme());

  let selectedIndex = 0;

  // O HTML inicial é renderizado com o Command de personagem.
  commandMenu.dataset.commandSet ??= "player";

  commandMenuController = {
    // Troca os botões mantendo o cursor (último filho do
    // .fui-command) e os listeners delegados.
    setCommands(commands) {
      getButtons().forEach((button) => button.remove());

      cursor.element.insertAdjacentHTML(
        "beforebegin",
        commandRenderer.renderButtons(commands),
      );

      selectedIndex = 0;

      updateSelection();
    },

    // O cursor é posicionado pela geometria do botão, que
    // não existe enquanto o Command está escondido.
    refreshCursor() {
      requestAnimationFrame(() => {
        cursor.update(getButtons()[selectedIndex]);
      });
    },
  };

  commandMenu.addEventListener("mouseenter", () => {
    commandMenu.classList.add("fui-ui-focused");
    commandMenu.focus();
  });

  commandMenu.addEventListener("mouseleave", () => {
    commandMenu.classList.remove("fui-ui-focused");
  });

  commandMenu.addEventListener("blur", () => {
    commandMenu.classList.remove("fui-ui-focused");
  });

  // ===================================================
  // UPDATE MENU SELECTION
  // ===================================================

  function updateSelection() {
    const buttons = getButtons();

    buttons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedIndex);
    });

    if (tooltip) {
      tooltip.textContent = buttons[selectedIndex]?.dataset.description ?? "";
    }

    cursor.update(buttons[selectedIndex]);
  }

  // ===================================================
  // KEYBOARD
  // ===================================================

  commandMenu.addEventListener("keydown", (event) => {
    const activeSubmenu = getActiveSubmenu(ui);

    if (activeSubmenu) {
      return;
    }

    const buttons = getButtons();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      if (buttons.length === 0) {
        return;
      }

      selectedIndex = (selectedIndex + 1) % buttons.length;

      updateSelection();
      playUISound("navigate");

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      if (buttons.length === 0) {
        return;
      }

      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;

      updateSelection();
      playUISound("navigate");

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("confirm");

      executeCommand(ui, selectedIndex, buttons);

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("cancel");

      return;
    }
  });

  // ===================================================
  // MOUSE / CLICK
  // ===================================================

  function getButtonFromEvent(event) {
    const button = event.target.closest(".fui-command-button");

    if (!button || button.parentElement !== commandMenu) {
      return null;
    }

    return button;
  }

  // mouseenter não propaga; mouseover sim, e também dispara
  // ao passar pelos filhos do botão, por isso o índice é
  // comparado antes de atualizar.
  commandMenu.addEventListener("mouseover", (event) => {
    const button = getButtonFromEvent(event);

    if (!button) {
      return;
    }

    const index = getButtons().indexOf(button);

    if (index === -1 || selectedIndex === index) {
      return;
    }

    selectedIndex = index;

    updateSelection();
    playUISound("navigate");
  });

  commandMenu.addEventListener("click", (event) => {
    const button = getButtonFromEvent(event);

    if (!button) {
      return;
    }

    const buttons = getButtons();

    selectedIndex = buttons.indexOf(button);

    updateSelection();
    playUISound("confirm");

    executeCommand(ui, selectedIndex, buttons);
  });

  // ===================================================
  // INITIAL SELECTION
  // ===================================================

  updateSelection();

  requestAnimationFrame(() => {
    cursor.update(getButtons()[selectedIndex]);
  });
}
