import { openActionMenu } from "../menus/action-menu.js";

import { createHudCursor } from "../shared/hud-cursor.js";

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

// =====================================================
// SET / GET SELECTED ACTOR
// =====================================================

export function updateCommandActor(actor, ui) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  selectedActor = actor ?? null;

  commandMenu.dataset.actorName = selectedActor?.name ?? "";

  console.log(
    "Fabula JRPG UI | Command Actor:",
    selectedActor?.name ?? "nenhum",
  );
}

export function getCommandActor() {
  return selectedActor;
}

// =====================================================
// CLEAR SELECTED ACTOR
// =====================================================

export function clearCommandActor(ui) {
  selectedActor = null;

  const commandMenu = ui?.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  commandMenu.dataset.actorName = "";
}

// =====================================================
// COMMAND HELPERS
// =====================================================

function getCommandFromButton(button) {
  return button
    ?.querySelector("span:last-child")
    ?.textContent.trim()
    .toUpperCase();
}

function getActorOrWarn() {
  if (selectedActor) {
    return selectedActor;
  }

  foundry.ui.notifications.warn("Nenhum personagem selecionado.");

  console.warn("Fabula JRPG UI | Command Menu: nenhum Actor selecionado.");

  return null;
}

function openItemActionMenu({ actor, ui, itemType, actionType, emptyMessage }) {
  const actions = actor.items.contents.filter((item) => item.type === itemType);

  if (actions.length === 0) {
    foundry.ui.notifications.warn(emptyMessage);
    return;
  }

  openActionMenu({
    actor,
    actions,
    actionType,
    ui,
  });
}

// =====================================================
// ATTACK
// =====================================================

function executeAttack(actor, ui) {
  const weapons = actor.items.contents.filter((item) => item.type === "weapon");

  if (weapons.length === 0) {
    foundry.ui.notifications.warn("Nenhuma arma disponível.");
    return;
  }

  openActionMenu({
    actor,
    actions: weapons,
    actionType: "attack",
    ui,
  });
}

// =====================================================
// SKILL
// =====================================================

function executeSkill(actor, ui) {
  openItemActionMenu({
    actor,
    ui,
    itemType: "spell",
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
    itemType: "consumable",
    actionType: "item",
    emptyMessage: "Nenhum Item disponível.",
  });
}

// =====================================================
// SIMPLE COMMANDS
// =====================================================

function executeSimpleCommand(command, actor, ui) {
  const handlers = {
    GUARD: executeGuard,
    HINDER: executeHinder,
    OBJECTIVE: executeObjective,
    STUDY: executeStudy,
    EQUIPMENT: executeEquipment,
  };

  const handler = handlers[command];

  if (!handler) {
    return false;
  }

  handler(actor, ui);

  return true;
}

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

  const actor = getActorOrWarn();

  if (!actor) {
    return;
  }

  // ===================================================
  // ACTION MENUS
  // ===================================================

  if (command === "ATTACK") {
    executeAttack(actor, ui);
    return;
  }

  if (command === "SKILL") {
    executeSkill(actor, ui);
    return;
  }

  if (command === "ITEM") {
    executeItem(actor, ui);
    return;
  }

  // ===================================================
  // SIMPLE COMMANDS
  // ===================================================

  if (executeSimpleCommand(command, actor, ui)) {
    return;
  }

  console.log("Command:", command);
}

// =====================================================
// SETUP COMMAND MENU
// =====================================================

export function setupCommandMenu(ui) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  const buttons = Array.from(
    commandMenu.querySelectorAll(".fui-command-button"),
  );

  const tooltip = ui.querySelector(".fui-command-tooltip");

  const cursor = createHudCursor(commandMenu);

  let selectedIndex = 0;
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

  buttons.forEach((button, index) => {
    button.addEventListener("mouseenter", () => {
      if (selectedIndex === index) {
        return;
      }

      selectedIndex = index;

      updateSelection();
      playUISound("navigate");
    });

    button.addEventListener("click", () => {
      selectedIndex = index;

      updateSelection();
      playUISound("confirm");

      executeCommand(ui, selectedIndex, buttons);
    });
  });

  // ===================================================
  // INITIAL SELECTION
  // ===================================================

  updateSelection();

  requestAnimationFrame(() => {
    cursor.update(buttons[selectedIndex]);
  });
}
