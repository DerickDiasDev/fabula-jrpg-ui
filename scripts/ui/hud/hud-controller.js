import {
  createCharacterCard,
  updateActiveCombatant,
  updateCharacterCard,
} from "../party/character-card.js";

import {
  setupCommandMenu,
  updateCommandActor,
} from "../command/command-menu.js";

import { applyHudLayout } from "./hud-customization.js";

import { closeActiveSubmenu } from "../menus/menu-utils.js";

// =====================================================
// REMOVE HUD
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
// CREATE HUD
// =====================================================

export function createFabulaUI() {
  // Nunca criar HUD duplicada.
  if (document.querySelector("#fabula-jrpg-ui")) {
    return;
  }

  if (!game.combat?.active) {
    return;
  }

  // ===================================================
  // PARTY ACTORS
  // ===================================================

  const actors = game.combat.combatants.contents
    .map((combatant) => combatant.actor)
    .filter((actor) => actor?.type === "character");

  // ===================================================
  // INITIAL COMMAND ACTOR
  // ===================================================

  const currentActor = game.combat?.combatant?.actor ?? null;
  const currentActorName = currentActor?.name ?? "";

  // ===================================================
  // CREATE HUD
  // ===================================================

  const ui = document.createElement("div");

  ui.id = "fabula-jrpg-ui";
  ui.tabIndex = 0;

  ui.innerHTML = `
    <div class="fui-command-wrapper">
      <div
        class="fui-command"
        data-actor-name="${currentActorName}"
      >
        <button class="fui-command-button fui-active">
          <span>Attack</span>
        </button>

        <button class="fui-command-button">
          <span>Skill</span>
        </button>

        <button class="fui-command-button">
          <span>Study</span>
        </button>

        <button class="fui-command-button">
          <span>Guard</span>
        </button>

        <button class="fui-command-button">
          <span>Item</span>
        </button>

        <button class="fui-command-button">
          <span>Equipment</span>
        </button>

        <button class="fui-command-button">
          <span>Hinder</span>
        </button>

        <button class="fui-command-button">
          <span>Objective</span>
        </button>
      </div>
    </div>

    <div class="fui-party-wrapper">
      <div class="fui-party-stats">
        ${actors.map(createCharacterCard).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(ui);

  // ===================================================
  // HUD LAYOUT
  // ===================================================

  applyHudLayout(ui);

  ui.focus();

  // ===================================================
  // KEYBOARD
  // ===================================================

  const keydownHandler = (event) => {
    if (event.key.toLowerCase() !== "f") {
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

  // ===================================================
  // COMMAND MENU
  // ===================================================

  setupCommandMenu(ui);

  // ===================================================
  // INITIAL STATE
  // ===================================================

  updateActiveCombatant(game.combat, ui);
  updateCommandActor(currentActor, ui);
}

// =====================================================
// REFRESH HUD
// =====================================================

export function refreshFabulaUI(combat) {
  if (!combat?.active) {
    removeFabulaUI();
    return;
  }

  createFabulaUI();

  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  // Atualiza somente o personagem
  // cujo turno está ativo.
  //
  // NÃO altera o Command Actor.

  updateActiveCombatant(combat, ui);
}

// =====================================================
// UPDATE ACTOR CARD
// =====================================================

export function updateFabulaActorCard(actor) {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  updateCharacterCard(actor, ui);
}

// =====================================================
// UPDATE COMMAND ACTOR
// =====================================================

export function updateFabulaCommandActor(actor) {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui || !actor) {
    return;
  }

  closeActiveSubmenu(ui);
  updateCommandActor(actor, ui);
}
