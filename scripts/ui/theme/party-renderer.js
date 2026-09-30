import {
  createCharacterCard,
  updateCharacterCard,
} from "../party/character-card.js";

import { createWizardryPartyRenderer } from "./wizardry/party-renderer.js";

export function createPartyRenderer(theme) {
  if (theme.id === "wizardry") {
    return createWizardryPartyRenderer();
  }

  return createOctopathPartyRenderer();
}

function createOctopathPartyRenderer() {
  return {
    render(members) {
      return members.map(createCharacterCard).join("");
    },

    updateCharacterCard(actor, ui) {
      updateCharacterCard(actor, ui);
    },
  };
}
