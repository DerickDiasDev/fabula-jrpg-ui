import { openActionMenu } from "./action-menu.js";

import { executeGuard } from "./guard-action.js";
import { executeHinder } from "./hinder-action.js";
import { executeObjective } from "./objective-action.js";
import { executeStudy } from "./study-action.js";
import { executeEquipment } from "./equipment-action.js";

import { getActiveSubmenu } from "./menu-utils.js";

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
// SETUP COMMAND MENU
// =====================================================

export function setupCommandMenu(ui) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  const buttons = commandMenu.querySelectorAll(".fui-command-button");

  const tooltip = ui.querySelector(".fui-command-tooltip");

  let selectedIndex = 0;

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
  }

  // ===================================================
  // EXECUTE COMMAND
  // ===================================================

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

    // =================================================
    // COMMAND ACTOR
    // =================================================

    const actor = selectedActor;

    if (!actor) {
      foundry.ui.notifications.warn("Nenhum personagem selecionado.");

      console.warn("Fabula JRPG UI | Command Menu: nenhum Actor selecionado.");

      return;
    }

    // =================================================
    // ATTACK
    // =================================================

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

    // =================================================
    // SKILL
    // =================================================

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

    // =================================================
    // GUARD
    // =================================================

    if (command === "GUARD") {
      executeGuard(actor, ui);
      return;
    }

    // =================================================
    // ITEM
    // =================================================

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

    // =================================================
    // HINDER
    // =================================================

    if (command === "HINDER") {
      executeHinder(actor, ui);
      return;
    }

    // =================================================
    // OBJECTIVE
    // =================================================

    if (command === "OBJECTIVE") {
      executeObjective(actor, ui);
      return;
    }

    // =================================================
    // STUDY
    // =================================================

    if (command === "STUDY") {
      executeStudy(actor, ui);
      return;
    }

    // =================================================
    // EQUIPMENT
    // =================================================

    if (command === "EQUIPMENT") {
      executeEquipment(actor, ui);
      return;
    }

    console.log("Command:", command);
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

  // ===================================================
  // MOUSE / CLICK
  // ===================================================

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      selectedIndex = index;

      updateSelection();
      executeCommand();
    });
  });

  // ===================================================
  // INITIAL SELECTION
  // ===================================================

  updateSelection();
}
