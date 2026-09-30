// =====================================================
// CARD TARGET VISUAL
// =====================================================

function getCardByActorId(actorId) {
  if (!actorId) {
    return null;
  }

  return document.querySelector(
    `.fui-character-card[data-actor-id="${actorId}"]`,
  );
}

function getCard(combatantId) {
  const combatant = game.combat?.combatants.get(combatantId);

  return getCardByActorId(combatant?.actor?.id);
}

export function createCardTargetVisual() {
  function setFocusedTarget(combatantId) {
    document.querySelectorAll(".fui-character-card").forEach((card) => {
      card.classList.remove("fui-target-focused");
    });

    const card = combatantId ? getCard(combatantId) : null;

    if (card) {
      card.classList.add("fui-target-focused");
    }
  }

  function setSelectedTargets(combatantIds) {
    const selectedIds = new Set(combatantIds);

    document.querySelectorAll(".fui-character-card").forEach((card) => {
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
    document.querySelectorAll(".fui-character-card").forEach((card) => {
      card.classList.remove("fui-target-focused", "fui-target-selected");
    });
  }

  return {
    setFocusedTarget,
    setSelectedTargets,
    destroy,
  };
}
