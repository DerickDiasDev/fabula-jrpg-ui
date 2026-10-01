import {
  selectCharacter,
  openCharacterSheet,
} from "./character-interaction.js";

import { getPartyMemberByActor } from "../party/party-data.js";

// =====================================================
// CHARACTER OWNERSHIP
// =====================================================

function canSelectCharacter(member) {
  const actor = member?.actor;

  if (!actor) {
    return false;
  }

  return actor.testUserPermission(game.user, "OWNER");
}

// =====================================================
// GET MEMBER
// =====================================================

function getCardMember(card) {
  const actor = game.actors.get(card?.dataset.actorId);

  return getPartyMemberByActor(actor);
}

// =====================================================
// CHARACTER CARD INTERACTION
// =====================================================
//
// Os listeners ficam no container .fui-party-stats, que não
// é recriado quando os cards são re-renderizados.
// =====================================================

export function setupCardInteraction(ui) {
  const partyStats = ui?.querySelector(".fui-party-stats");

  if (!partyStats || partyStats._fabulaCardInteraction) {
    return;
  }

  partyStats._fabulaCardInteraction = true;

  partyStats.addEventListener("click", (event) => {
    const card = event.target.closest(".fui-character-card");

    if (!card) {
      return;
    }

    const member = getCardMember(card);

    if (!canSelectCharacter(member)) {
      return;
    }

    selectCharacter(member, ui);
  });

  partyStats.addEventListener("dblclick", (event) => {
    const portrait = event.target.closest(
      ".fui-character-card .fui-character-portrait",
    );

    if (!portrait) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const member = getCardMember(portrait.closest(".fui-character-card"));

    openCharacterSheet(member);
  });
}
