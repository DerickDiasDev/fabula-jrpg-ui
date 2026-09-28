import { getTokenForActor } from "./token-selection.js";

// =====================================================
// ADD ACTORS TO COMBAT
// =====================================================

export async function addActorsToCombat(actors) {
  if (!actors?.length) {
    return;
  }

  for (const actor of actors) {
    const token = getTokenForActor(actor);

    if (!token) {
      continue;
    }

    if (token.combatant) {
      continue;
    }

    await token.document.toggleCombatant();
  }
}
