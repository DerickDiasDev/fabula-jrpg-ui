import { updateCommandActor } from "../command/command-menu.js";
import { closeActiveSubmenu } from "../menus/menu-utils.js";

// =====================================================
// SELECT CHARACTER
// =====================================================

export function selectCharacter(member, ui) {
  const actor = member?.actor;

  if (!actor || !ui) {
    return;
  }

  ui.querySelectorAll(".fui-character-card").forEach((card) => {
    card.classList.toggle(
      "fui-character-selected",
      card.dataset.actorId === actor.id,
    );
  });

  closeActiveSubmenu(ui);
  updateCommandActor(actor, ui);
}

// =====================================================
// OPEN CHARACTER SHEET
// =====================================================

export function openCharacterSheet(member) {
  const actor = member?.actor;

  if (!actor) {
    return;
  }

  actor.sheet?.render(true);
}
