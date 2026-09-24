import { createPartyMember } from "./party-member.js";

export function getPartyMembers() {
  return game.actors.contents
    .filter((actor) => actor.type === "character")
    .map(createPartyMember)
    .filter(Boolean);
}
