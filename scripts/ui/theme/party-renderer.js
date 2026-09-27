import { createCharacterCard } from "../party/character-card.js";

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
  };
}

function createWizardryPartyRenderer() {
  return {
    render(members) {
      return members.map(createCharacterCard).join("");
    },
  };
}
