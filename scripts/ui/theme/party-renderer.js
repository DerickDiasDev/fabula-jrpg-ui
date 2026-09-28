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
      const cards = members.map(createCharacterCard).join("");

      return cards;
    },
  };
}

function createWizardryPartyRenderer() {
  return {
    render(members) {
      const addToCombatButton = game.user.isGM
        ? `
            <button
              type="button"
              class="fui-wizardry-add-to-combat"
            >
              Add to Combat
            </button>
          `
        : "";

      return `
        <div class="fui-wizardry-party">
          ${members
            .map(
              (member) => `
                <button
                  type="button"
                  class="fui-wizardry-party-member"
                  data-actor-id="${member.actor.id}"
                >
                  <span class="fui-wizardry-party-member-name">
                    ${member.actor.name}
                  </span>
                </button>
              `,
            )
            .join("")}

          ${addToCombatButton}
        </div>
      `;
    },
  };
}
