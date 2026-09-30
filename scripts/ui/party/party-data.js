import { createPartyMember } from "./party-member.js";

export function getPartyMembers() {
  return game.actors.contents
    .filter((actor) => actor.type === "character")
    .map(createPartyMember)
    .filter(Boolean);
}

export function getPartyMemberByActor(actor) {
  if (!actor) {
    return null;
  }

  return (
    getPartyMembers().find((member) => member.actor.id === actor.id) ?? null
  );
}

// =====================================================
// COMBAT PARTY
// =====================================================

export function getCombatPartyMembers(combat = game.combat) {
  if (!combat) {
    return [];
  }

  const combatActorIds = new Set(
    combat.combatants.map((combatant) => combatant.actor?.id).filter(Boolean),
  );

  return getPartyMembers().filter((member) =>
    combatActorIds.has(member.actor.id),
  );
}
