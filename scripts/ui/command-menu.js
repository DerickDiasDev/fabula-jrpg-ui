import { openActionMenu } from "./action-menu.js";
import { executeGuard } from "./guard-action.js";
import { executeHinder } from "./hinder-action.js";
import { executeObjective } from "./objective-action.js";
import { executeStudy } from "./study-action.js";
import { executeEquipment } from "./equipment-action.js";
import { getActiveSubmenu } from "./menu-utils.js";

export function setupCommandMenu(ui) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  const buttons = commandMenu.querySelectorAll(".fui-command-button");
  const tooltip = ui.querySelector(".fui-command-tooltip"); // NOVO

  let selectedIndex = 0;

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedIndex);
    });

    // NOVO
    if (tooltip) {
      tooltip.textContent = buttons[selectedIndex]?.dataset.description ?? "";
    }
  }

  function executeCommand() {
    const activeSubmenu = getActiveSubmenu(ui);

    if (activeSubmenu) {
      return;
    }

    const button = buttons[selectedIndex];

    if (!button) {
      return;
    }

    const command = button
      .querySelector("span:last-child")
      ?.textContent.trim()
      .toUpperCase();

    const combatant = game.combat?.combatant;

    const actor = combatant?.actor;

    if (!actor) {
      console.error("COMMAND: ator do combatente não encontrado.");
      return;
    }

    if (command === "ATTACK") {
      const weapons = actor.items.contents.filter(
        (item) => item.type === "weapon",
      );

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

      return;
    }

    if (command === "SKILL") {
      const skills = actor.items.contents.filter(
        (item) => item.type === "spell",
      );

      if (skills.length === 0) {
        foundry.ui.notifications.warn("Nenhuma Skill disponível.");
        return;
      }

      openActionMenu({
        actor,
        actions: skills,
        actionType: "skill",
        ui,
      });

      return;
    }

    if (command === "GUARD") {
      executeGuard(actor, ui);
      return;
    }

    if (command === "ITEM") {
      const items = actor.items.contents.filter(
        (item) => item.type === "consumable",
      );

      if (items.length === 0) {
        foundry.ui.notifications.warn("Nenhum Item disponível.");
        return;
      }

      openActionMenu({
        actor,
        actions: items,
        actionType: "item",
        ui,
      });

      return;
    }

    if (command === "HINDER") {
      executeHinder(actor, ui);
      return;
    }

    if (command === "OBJECTIVE") {
      executeObjective(actor, ui);
      return;
    }

    if (command === "STUDY") {
      executeStudy(actor, ui);
      return;
    }

    if (command === "EQUIPMENT") {
      executeEquipment(actor, ui);
      return;
    }

    console.log("Command:", command);
  }

  commandMenu.addEventListener("keydown", (event) => {
    const activeSubmenu = getActiveSubmenu(ui);

    if (activeSubmenu) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      selectedIndex = (selectedIndex + 1) % buttons.length;

      updateSelection();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;

      updateSelection();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      executeCommand();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      selectedIndex = index;

      updateSelection();

      executeCommand();
    });
  });

  updateSelection();
}

export function updateCommandActor(combat, ui) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  const actor = combat?.combatant?.actor;

  commandMenu.dataset.actorName = actor?.name ?? "";
}
