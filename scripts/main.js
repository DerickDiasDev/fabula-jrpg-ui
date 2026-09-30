import {
  refreshFabulaUI,
  updateFabulaActorCard,
} from "./ui/hud/hud-controller.js";

import { registerHudSettings } from "./ui/hud/hud-customization.js";
import { registerAudioSettings } from "./ui/shared/audio.js";

import {
  getPartyMemberByActor,
  getCombatPartyMembers,
} from "./ui/party/party-data.js";

import { selectCharacter } from "./ui/interaction/character-interaction.js";

Hooks.once("init", () => {
  registerHudSettings();
  registerAudioSettings();

  game.settings.register("fabula-jrpg-ui", "theme", {
    name: "HUD Theme",
    hint: "Select the visual theme used by the Fabula JRPG UI.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      octopath: "Octopath",
      wizardry: "Wizardry",
    },
    default: "octopath",
    onChange: (themeId) => {
      window.location.reload();
    },
  });
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

  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  const member = getPartyMemberByActor(selectedActor);

  if (!member) {
    return;
  }

  selectCharacter(member, ui);
});

Hooks.on("deleteCombat", async () => {
  refreshFabulaUI(null);

  const temporaryTokens = canvas.scene?.tokens.filter(
    (token) => token.flags?.["fabula-jrpg-ui"]?.temporaryCombatToken,
  );

  if (!temporaryTokens?.length) return;

  await canvas.scene.deleteEmbeddedDocuments(
    "Token",
    temporaryTokens.map((token) => token.id),
  );
});
