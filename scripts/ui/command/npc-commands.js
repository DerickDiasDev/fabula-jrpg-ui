import { openItemActionMenu } from "../menus/action-menu.js";

import { executeGuard, executeHinder } from "../actions/simple-actions.js";

// =====================================================
// ATTACK
// =====================================================

function executeNpcAttack(actor, ui) {
  // Armas só contam como ataque se o NPC tem o poder
  // Usar Equipamento; os ataques básicos sempre contam.
  const itemTypes = actor.system?.useEquipment?.value
    ? ["basic", "weapon", "customWeapon"]
    : ["basic"];

  openItemActionMenu({
    actor,
    ui,
    itemTypes,
    actionType: "attack",
    emptyMessage: "Nenhum ataque disponível.",
  });
}

// =====================================================
// SPELL
// =====================================================

function executeNpcSpell(actor, ui) {
  openItemActionMenu({
    actor,
    ui,
    itemTypes: ["spell"],
    actionType: "spell",
    emptyMessage: "Nenhum feitiço disponível.",
  });
}

// =====================================================
// SKILL
// =====================================================

function executeNpcSkill(actor, ui) {
  openItemActionMenu({
    actor,
    ui,
    itemTypes: ["skill", "miscAbility"],
    actionType: "skill",
    emptyMessage: "Nenhuma Skill disponível.",
  });
}

// =====================================================
// HANDLERS
// =====================================================

export const NPC_COMMAND_HANDLERS = {
  attack: executeNpcAttack,
  spell: executeNpcSpell,
  skill: executeNpcSkill,
  guard: executeGuard,
  hinder: executeHinder,
};
