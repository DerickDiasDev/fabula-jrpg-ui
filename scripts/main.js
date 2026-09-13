import {
  createCharacterCard,
  updateCharacterCard,
  updateActiveCombatant,
} from "./ui/character-card.js";

import { setupCommandMenu, updateCommandActor } from "./ui/command-menu.js";

export function createFabulaUI() {
  if (document.querySelector("#fabula-jrpg-ui")) {
    return;
  }

  const actors = game.combat.combatants.contents
    .map((combatant) => combatant.actor)
    .filter((actor) => actor?.type === "character");

  const currentActorName = game.combat?.combatant?.actor?.name ?? "";

  const ui = document.createElement("div");

  ui.id = "fabula-jrpg-ui";

  ui.tabIndex = 0;

  ui.innerHTML = `
    <!-- COMMAND MENU -->
    <div class="fabula-command" data-actor-name="${currentActorName}">
      <button class="command-button active">
        <span>Attack</span>
      </button>

      <button class="command-button">
        <span>Skill</span>
      </button>

      <button class="command-button">
        <span>Study</span>
      </button>

      <button class="command-button">
        <span>Guard</span>
      </button>

      <button class="command-button">
        <span>Item</span>
      </button>

      <button class="command-button">
        <span>Equipment</span>
      </button>

      <button class="command-button">
        <span>Hinder</span>
      </button>

      <button class="command-button">
        <span>Objective</span>
      </button>
    </div>

    <!-- PARTY -->
    <div class="fabula-party-stats">
      ${actors.map(createCharacterCard).join("")}
    </div>
  `;

  document.body.appendChild(ui);

  ui.focus();

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "f") {
      return;
    }

    const activeSubmenu = ui.querySelector(".fabula-submenu:not([hidden])");

    if (activeSubmenu) {
      return;
    }

    event.preventDefault();

    const commandMenu = ui.querySelector(".fabula-command");

    if (!commandMenu) {
      return;
    }

    commandMenu.tabIndex = 0;

    commandMenu.focus();

    commandMenu.classList.add("ui-focused");
  });

  setupCommandMenu(ui);

  Hooks.on("updateActor", (updatedActor) => {
    updateCharacterCard(updatedActor, ui);
  });

  Hooks.on("updateCombat", (combat) => {
    updateActiveCombatant(combat, ui);
    updateCommandActor(combat, ui);
  });

  if (game.combat) {
    updateActiveCombatant(game.combat, ui);
    updateCommandActor(game.combat, ui);
  }
}

Hooks.once("ready", () => {
  createFabulaUI();
});
