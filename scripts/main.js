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

import { hideAllSubmenus } from "./ui/menus/menu-utils.js";

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
      wizardry: "Wizardry",
      octopath: "Octopath",
    },
    default: "wizardry",
    onChange: (themeId) => {
      window.location.reload();
    },
  });
});

Hooks.once("ready", () => {
  refreshFabulaUI(game.combat);
});

// =====================================================
// SCENE CHANGE
// =====================================================
//
// game.combat depende da cena exibida. Submenus abertos
// apontam para tokens da cena anterior e são fechados antes
// do canvas ser destruído; depois o HUD é atualizado com o
// combate da nova cena.
// =====================================================

Hooks.on("canvasTearDown", () => {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  hideAllSubmenus(ui);
});

Hooks.on("canvasReady", () => {
  // O primeiro canvasReady ocorre antes do "ready",
  // que já cria o HUD.
  if (!game.ready) {
    return;
  }

  refreshFabulaUI(game.combat);
});

Hooks.on("combatStart", (combat) => {
  refreshFabulaUI(combat);
});

// O combate alterado pode ser de outra cena; o HUD sempre
// reflete o combate exibido (game.combat).
Hooks.on("updateCombat", () => {
  refreshFabulaUI(game.combat);
});

Hooks.on("createCombat", () => {
  refreshFabulaUI(game.combat);
});

Hooks.on("createCombatant", () => {
  refreshFabulaUI(game.combat);
});

Hooks.on("deleteCombatant", () => {
  refreshFabulaUI(game.combat);
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
    if (!game.user.isGM) {
      foundry.ui.notifications.warn(
        "Selecione apenas um personagem para usar o Command Menu.",
      );
    }

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

  // Apenas o GM ativo remove os tokens temporários, para que
  // jogadores (sem permissão) e outros GMs não tentem apagar.
  if (!game.users.activeGM?.isSelf) return;

  const temporaryTokens = canvas.scene?.tokens.filter(
    (token) => token.flags?.["fabula-jrpg-ui"]?.temporaryCombatToken,
  );

  if (!temporaryTokens?.length) return;

  await canvas.scene.deleteEmbeddedDocuments(
    "Token",
    temporaryTokens.map((token) => token.id),
  );
});
