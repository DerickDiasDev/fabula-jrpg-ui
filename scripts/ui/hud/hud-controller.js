import { updateActiveCombatant } from "../party/character-card.js";

import {
  setupCommandMenu,
  updateCommandActor,
} from "../command/command-menu.js";

import { setupCardInteraction } from "../interaction/card-interaction.js";

import { getCurrentTheme, applyTheme } from "../theme/theme-manager.js";

import { applyHudLayout } from "./hud-customization.js";

import { getPartyMembers, getCombatPartyMembers } from "../party/party-data.js";

import { createPartyRenderer } from "../theme/party-renderer.js";

import { selectCharacter } from "../interaction/character-interaction.js";

import { createCommandRenderer } from "../theme/command-renderer.js";

import {
  setupThemeInteraction,
  refreshThemeInteraction,
} from "../theme/theme-interaction.js";

// =====================================================
// COMBAT STATE
// =====================================================
//
// `combat.active` indica apenas que o encontro é o ativo da
// cena; o combate só está em andamento depois de iniciado
// (round > 0). Command HUD e Party filtrada dependem disso.
// =====================================================

function isCombatRunning(combat) {
  return Boolean(combat?.active && combat?.started);
}

// =====================================================
// REMOVE FABULA UI
// =====================================================

export function removeFabulaUI() {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  if (ui._fabulaKeydownHandler) {
    document.removeEventListener("keydown", ui._fabulaKeydownHandler);

    delete ui._fabulaKeydownHandler;
  }

  ui.remove();
}

// =====================================================
// CREATE FABULA UI
// =====================================================

export function createFabulaUI() {
  if (document.querySelector("#fabula-jrpg-ui")) {
    return;
  }

  const currentActor = game.combat?.combatant?.actor ?? null;

  const currentActorName = currentActor?.name ?? "";

  const isCombatActive = isCombatRunning(game.combat);

  const ui = document.createElement("div");

  ui.id = "fabula-jrpg-ui";

  const theme = getCurrentTheme();

  ui.dataset.theme = theme.id;

  const commandRenderer = createCommandRenderer(theme);

  ui.tabIndex = 0;

  ui.innerHTML = `
    <div
      class="fui-command-wrapper"
      ${isCombatActive ? "" : "hidden"}
    >
      ${commandRenderer.render(currentActorName)}
    </div>

    <div class="fui-party-wrapper">
      <div class="fui-party-stats"></div>
    </div>
  `;

  document.body.appendChild(ui);

  applyTheme(theme, ui);

  updatePartyRenderer(ui, game.combat);

  // As interações da Party usam delegação de eventos no
  // container .fui-party-stats, que nunca é recriado; por
  // isso são configuradas uma única vez.
  setupCardInteraction(ui);

  setupThemeInteraction(theme, ui);

  applyHudLayout(ui);

  ui.focus();

  // ===================================================
  // KEYBOARD HANDLER
  // ===================================================

  const keydownHandler = (event) => {
    if (!isCombatRunning(game.combat)) {
      return;
    }

    if (event.key.toLowerCase() !== "f") {
      return;
    }

    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLSelectElement ||
      activeElement?.isContentEditable ||
      activeElement instanceof HTMLButtonElement
    ) {
      return;
    }

    const activeSubmenu = ui.querySelector(".fui-submenu:not([hidden])");

    if (activeSubmenu) {
      return;
    }

    event.preventDefault();

    const commandMenu = ui.querySelector(".fui-command");

    if (!commandMenu) {
      return;
    }

    commandMenu.tabIndex = 0;

    commandMenu.focus();

    commandMenu.classList.add("fui-ui-focused");
  };

  ui._fabulaKeydownHandler = keydownHandler;

  document.addEventListener("keydown", keydownHandler);

  setupCommandMenu(ui);

  // ===================================================
  // INITIAL COMBAT STATE
  // ===================================================

  if (isCombatRunning(game.combat)) {
    updateActiveCombatant(game.combat, ui);

    updateCommandActor(currentActor, ui);
  }
}

// =====================================================
// REFRESH FABULA UI
// =====================================================

export function refreshFabulaUI(combat = game.combat) {
  console.log("=== REFRESH FABULA UI ===");
  console.log("combat:", combat);
  console.log(
    "combatants:",
    combat?.combatants?.contents?.map((combatant) => ({
      id: combatant.id,
      actorId: combatant.actorId,
      actorName: combatant.actor?.name,
      tokenId: combatant.tokenId,
    })),
  );
  console.log(
    "combat party:",
    getCombatPartyMembers(combat).map((member) => member.actor.name),
  );

  createFabulaUI();

  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  updatePartyRenderer(ui, combat);

  const commandWrapper = ui.querySelector(".fui-command-wrapper");

  if (commandWrapper) {
    commandWrapper.hidden = !isCombatRunning(combat);
  }

  // A Party é re-renderizada acima com uma lista que pode
  // mudar de tamanho (ex.: fim de combate), então o layout
  // precisa ser recalculado dentro e fora de combate.
  applyHudLayout(ui);

  // Os cards podem sobreviver ao fim do combate (mesma lista
  // de membros), então o destaque de turno é limpo aqui.
  if (!isCombatRunning(combat)) {
    updateActiveCombatant(null, ui);
    return;
  }

  updateActiveCombatant(combat, ui);

  const currentActor = combat.combatant?.actor ?? null;

  updateCommandActor(currentActor, ui);
}

// =====================================================
// UPDATE ACTOR CARD
// =====================================================

export function updateFabulaActorCard(actor) {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui || !actor) {
    return;
  }

  const theme = getCurrentTheme();

  const partyRenderer = createPartyRenderer(theme);

  partyRenderer.updateCharacterCard(actor, ui);
}

// =====================================================
// UPDATE COMMAND ACTOR
// =====================================================

export function updateFabulaCommandActor(actor, token = null) {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui || !actor) {
    return;
  }

  selectCharacter(
    {
      actor,
      token,
    },
    ui,
  );
}

// =====================================================
// UPDATE PARTY RENDERER
// =====================================================

function updatePartyRenderer(ui, combat = game.combat) {
  const partyStats = ui.querySelector(".fui-party-stats");

  if (!partyStats) {
    return;
  }

  const theme = getCurrentTheme();

  const partyRenderer = createPartyRenderer(theme);

  const members = isCombatRunning(combat)
    ? getCombatPartyMembers(combat)
    : getPartyMembers();

  // Com a mesma lista de membros os cards existentes continuam
  // válidos: os dados deles são atualizados pelos hooks de
  // Actor/ActiveEffect. Re-renderizar só quando a lista muda
  // preserva seleção e estados visuais entre turnos.
  const memberIds = members.map((member) => member.actor.id).join(",");

  if (partyStats.dataset.memberIds === memberIds) {
    return;
  }

  partyStats.dataset.memberIds = memberIds;

  partyStats.innerHTML = partyRenderer.render(members);

  refreshThemeInteraction(theme, ui);
}
