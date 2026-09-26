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
