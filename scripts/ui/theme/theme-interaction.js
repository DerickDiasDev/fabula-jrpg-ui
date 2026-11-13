import {
  setupWizardryPartyInteraction,
  refreshWizardryPartyInteraction,
} from "./wizardry/party-interaction.js";

// Chamado uma única vez, quando o HUD é criado.
export function setupThemeInteraction(theme, ui) {
  if (!theme || !ui) {
    return;
  }

  if (theme.id === "wizardry") {
    setupWizardryPartyInteraction(ui);
  }
}

// Chamado sempre que os cards da Party são re-renderizados.
export function refreshThemeInteraction(theme, ui) {
  if (!theme || !ui) {
    return;
  }

  if (theme.id === "wizardry") {
    refreshWizardryPartyInteraction(ui);
  }
}
