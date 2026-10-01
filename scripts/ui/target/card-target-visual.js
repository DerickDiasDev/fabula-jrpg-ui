import { getPartyCard, getPartyCards } from "../party/party-card.js";

// =====================================================
// CARD TARGET VISUAL
// =====================================================

function getCard(combatantId) {
  const combatant = game.combat?.combatants.get(combatantId);

  return getPartyCard(combatant?.actor?.id);
}

export function createCardTargetVisual() {
  function setFocusedTarget(combatantId) {
    getPartyCards().forEach((card) => {
      card.classList.remove("fui-target-focused");
    });

    const card = combatantId ? getCard(combatantId) : null;

    if (card) {
      card.classList.add("fui-target-focused");
    }
  }

  function setSelectedTargets(combatantIds) {
    const selectedIds = new Set(combatantIds);

    getPartyCards().forEach((card) => {
      const actorId = card.dataset.actorId;

      const combatant = game.combat?.combatants.contents.find(
        (combatant) => combatant.actor?.id === actorId,
      );

      card.classList.toggle(
        "fui-target-selected",
        combatant ? selectedIds.has(combatant.id) : false,
      );
    });
  }

  function destroy() {
    getPartyCards().forEach((card) => {
      card.classList.remove("fui-target-focused", "fui-target-selected");
    });
  }

  return {
    setFocusedTarget,
    setSelectedTargets,
    destroy,
  };
}
