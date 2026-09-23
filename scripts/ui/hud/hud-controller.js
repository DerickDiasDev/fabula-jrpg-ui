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

export function createFabulaUI() {
  if (document.querySelector("#fabula-jrpg-ui")) {
    return;
  }

  const actors = game.actors.contents.filter(
    (actor) => actor.type === "character",
  );

  const currentActor = game.combat?.combatant?.actor ?? null;
  const currentActorName = currentActor?.name ?? "";
  const isCombatActive = game.combat?.active ?? false;

  const ui = document.createElement("div");

  ui.id = "fabula-jrpg-ui";
  ui.tabIndex = 0;

  ui.innerHTML = `
    <div class="fui-command-wrapper" ${isCombatActive ? "" : "hidden"}>
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

  applyHudLayout(ui);

  ui.focus();

  const keydownHandler = (event) => {
    if (!game.combat?.active) {
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

  if (game.combat?.active) {
    updateActiveCombatant(game.combat, ui);
    updateCommandActor(currentActor, ui);
  }
}

export function refreshFabulaUI(combat = game.combat) {
  createFabulaUI();

  const ui = document.querySelector("#fabula-jrpg-ui");
  if (!ui) {
    return;
  }

  const commandWrapper = ui.querySelector(".fui-command-wrapper");

  if (commandWrapper) {
    commandWrapper.hidden = !combat?.active;
  }

  if (!combat?.active) {
    return;
  }

  applyHudLayout(ui);

  updateActiveCombatant(combat, ui);

  const currentActor = combat.combatant?.actor ?? null;
  updateCommandActor(currentActor, ui);
}

export function updateFabulaActorCard(actor) {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  updateCharacterCard(actor, ui);
}

export function updateFabulaCommandActor(actor) {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui || !actor) {
    return;
  }

  closeActiveSubmenu(ui);
  updateCommandActor(actor, ui);
}
