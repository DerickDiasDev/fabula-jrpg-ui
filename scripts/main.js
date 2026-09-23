import {
  refreshFabulaUI,
  updateFabulaActorCard,
  updateFabulaCommandActor,
} from "./ui/hud/hud-controller.js";

import { registerHudSettings } from "./ui/hud/hud-customization.js";
import { registerAudioSettings } from "./ui/shared/audio.js";

Hooks.once("init", () => {
  registerHudSettings();
  registerAudioSettings();
});

Hooks.once("ready", () => {
  refreshFabulaUI(game.combat);
});

Hooks.on("combatStart", (combat) => {
  refreshFabulaUI(combat);
});

Hooks.on("updateCombat", (combat) => {
  refreshFabulaUI(combat);
});

Hooks.on("updateActor", (updatedActor) => {
  updateFabulaActorCard(updatedActor);
});

Hooks.on("createActiveEffect", (effect) => {
  const actor = effect.parent;

  if (!actor) {
    return;
  }

  updateFabulaActorCard(actor);
});

Hooks.on("updateActiveEffect", (effect) => {
  const actor = effect.parent;

  if (!actor) {
    return;
  }

  updateFabulaActorCard(actor);
});

Hooks.on("deleteActiveEffect", (effect) => {
  const actor = effect.parent;

  if (!actor) {
    return;
  }

  updateFabulaActorCard(actor);
});

Hooks.on("controlToken", (token, controlled) => {
  if (!controlled) {
    return;
  }

  const actor = token?.actor;

  if (!actor) {
    return;
  }

  if (actor.type !== "character") {
    return;
  }

  const isOwner = actor.testUserPermission(game.user, "OWNER");

  if (!isOwner) {
    return;
  }

  const controlledTokens = canvas.tokens.controlled ?? [];

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

  if (ownedTokens.length > 1) {
    foundry.ui.notifications.warn(
      "Selecione apenas um personagem para usar o Command Menu.",
    );
    return;
  }

  if (ownedTokens.length === 0) {
    return;
  }

  const selectedToken = ownedTokens[0];
  const selectedActor = selectedToken.actor;

  updateFabulaCommandActor(selectedActor);
});

Hooks.on("deleteCombat", () => {
  refreshFabulaUI(null);
});
