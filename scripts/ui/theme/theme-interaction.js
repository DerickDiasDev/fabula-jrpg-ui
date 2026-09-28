import { setupWizardryPartyInteraction } from "./wizardry/party-interaction.js";

export function setupThemeInteraction(theme, ui) {
  if (!theme || !ui) {
    return;
  }

  if (theme.id === "wizardry") {
    setupWizardryPartyInteraction(ui);
  }
}
