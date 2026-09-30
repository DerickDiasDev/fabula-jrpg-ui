import {
  selectCharacter,
  openCharacterSheet,
} from "./character-interaction.js";

import { getPartyMembers } from "../party/party-data.js";

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
// CHARACTER CARD INTERACTION
// =====================================================

export function setupCardInteraction(ui) {
  if (!ui) {
    return;
  }

  const cards = ui.querySelectorAll(".fui-character-card");

  if (cards.length === 0) {
    return;
  }

  const partyMembers = getPartyMembers();

  cards.forEach((card) => {
    const actorId = card.dataset.actorId;

    if (!actorId) {
      return;
    }

    const member = partyMembers.find(
      (partyMember) => partyMember.actor.id === actorId,
    );

    if (!member) {
      return;
    }

    card.addEventListener("click", () => {
      if (!canSelectCharacter(member)) {
        return;
      }

      selectCharacter(member, ui);
    });

    const portrait = card.querySelector(".fui-character-portrait");

    portrait?.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();

      openCharacterSheet(member);
    });
  });
}
