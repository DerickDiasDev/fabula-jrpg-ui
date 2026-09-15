import {
  refreshFabulaUI,
  removeFabulaUI,
  updateFabulaActorCard,
  updateFabulaCommandActor,
} from "./ui/hud/hud-controller.js";

import { registerHudSettings } from "./ui/hud/hud-customization.js";

// =====================================================
// FOUNDry READY
// =====================================================

Hooks.once("init", () => {
  registerHudSettings();
});

Hooks.once("ready", () => {
  refreshFabulaUI(game.combat);
});

// =====================================================
// COMBAT START
// =====================================================

Hooks.on("combatStart", (combat) => {
  refreshFabulaUI(combat);
});

// =====================================================
// COMBAT UPDATES
// =====================================================

Hooks.on("updateCombat", (combat) => {
  refreshFabulaUI(combat);
});

// =====================================================
// ACTOR UPDATES
// =====================================================

Hooks.on("updateActor", (updatedActor) => {
  updateFabulaActorCard(updatedActor);
});

// =====================================================
// TOKEN SELECTION
// =====================================================

Hooks.on("controlToken", (token, controlled) => {
  // -------------------------------------------------
  // IGNORA DESELEÇÃO
  // -------------------------------------------------

  if (!controlled) {
    return;
  }

  // -------------------------------------------------
  // ACTOR
  // -------------------------------------------------

  const actor = token?.actor;

  if (!actor) {
    return;
  }

  // -------------------------------------------------
  // ACTOR TYPE
  // -------------------------------------------------

  if (actor.type !== "character") {
    return;
  }

  // -------------------------------------------------
  // OWNERSHIP
  // -------------------------------------------------

  const isOwner = actor.testUserPermission(game.user, "OWNER");

  if (!isOwner) {
    console.log(
      "Fabula JRPG UI | Token selecionado não pertence ao jogador:",
      token.name,
    );

    return;
  }

  // -------------------------------------------------
  // CONTROLLED TOKENS
  // -------------------------------------------------

  const controlledTokens = canvas.tokens.controlled ?? [];

  // -------------------------------------------------
  // FILTER OWNED TOKENS
  // -------------------------------------------------

  const ownedTokens = controlledTokens.filter((controlledToken) => {
    const controlledActor = controlledToken?.actor;

    if (!controlledActor) {
      return false;
    }

    if (controlledActor.type !== "character") {
      return false;
    }

    return controlledActor.testUserPermission(game.user, "OWNER");
  });

  // -------------------------------------------------
  // MULTIPLE OWNED TOKENS
  // -------------------------------------------------

  if (ownedTokens.length > 1) {
    foundry.ui.notifications.warn(
      "Selecione apenas um personagem para usar o Command Menu.",
    );

    console.warn(
      "Fabula JRPG UI | Mais de um Token próprio selecionado:",
      ownedTokens.map((controlledToken) => controlledToken.name),
    );

    return;
  }

  // -------------------------------------------------
  // NO OWNED TOKEN
  // -------------------------------------------------

  if (ownedTokens.length === 0) {
    return;
  }

  // -------------------------------------------------
  // SINGLE OWNED TOKEN
  // -------------------------------------------------

  const selectedToken = ownedTokens[0];
  const selectedActor = selectedToken.actor;

  updateFabulaCommandActor(selectedActor);
});

// =====================================================
// COMBAT END
// =====================================================

Hooks.on("deleteCombat", () => {
  removeFabulaUI();
});
