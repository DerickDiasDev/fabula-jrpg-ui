import {
  createCharacterCard,
  updateCharacterCard,
  updateActiveCombatant,
} from "./ui/character-card.js";

import { setupCommandMenu, updateCommandActor } from "./ui/command-menu.js";

import { closeActiveSubmenu } from "./ui/menu-utils.js";
import { registerHudSettings, applyHudLayout } from "./ui/hud-customization.js";

// =====================================================
// UI LIFECYCLE
// =====================================================

function removeFabulaUI() {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  // Remove o keyboard listener registrado especificamente
  // para esta HUD.
  if (ui._fabulaKeydownHandler) {
    document.removeEventListener("keydown", ui._fabulaKeydownHandler);

    delete ui._fabulaKeydownHandler;
  }

  ui.remove();
}

// =====================================================
// CREATE UI
// =====================================================

export function createFabulaUI() {
  // Nunca criar HUD duplicada.
  if (document.querySelector("#fabula-jrpg-ui")) {
    return;
  }

  if (!game.combat?.active) {
    return;
  }

  // ===================================================
  // PARTY ACTORS
  // ===================================================

  const actors = game.combat.combatants.contents
    .map((combatant) => combatant.actor)
    .filter((actor) => actor?.type === "character");

  // ===================================================
  // INITIAL COMMAND ACTOR
  // ===================================================
  //
  // Somente na criação inicial da HUD usamos o
  // combatant ativo como personagem inicial.
  //
  // Depois disso, mudanças de turno NÃO alteram
  // o Command Actor.
  //

  const currentActor = game.combat?.combatant?.actor ?? null;

  const currentActorName = currentActor?.name ?? "";

  // ===================================================
  // CREATE HUD
  // ===================================================

  const ui = document.createElement("div");

  ui.id = "fabula-jrpg-ui";

  ui.tabIndex = 0;

  ui.innerHTML = `
    <!-- COMMAND MENU -->

    <div
      class="fui-command"
      data-actor-name="${currentActorName}"
    >

      <button class="fui-command-button fui-active">
        <span>Attack</span>
      </button>

      <button class="fui-command-button">
        <span>Skill</span>
      </button>

      <button class="fui-command-button">
        <span>Study</span>
      </button>

      <button class="fui-command-button">
        <span>Guard</span>
      </button>

      <button class="fui-command-button">
        <span>Item</span>
      </button>

      <button class="fui-command-button">
        <span>Equipment</span>
      </button>

      <button class="fui-command-button">
        <span>Hinder</span>
      </button>

      <button class="fui-command-button">
        <span>Objective</span>
      </button>

    </div>

    <!-- PARTY -->

    <div class="fui-party-stats">
      ${actors.map(createCharacterCard).join("")}
    </div>
  `;

  document.body.appendChild(ui);

  applyHudLayout(ui);

  ui.focus();

  // ===================================================
  // KEYBOARD
  // ===================================================

  const keydownHandler = (event) => {
    if (event.key.toLowerCase() !== "f") {
      return;
    }

    const activeSubmenu = ui.querySelector(".fui-submenu:not([hidden])");

    if (activeSubmenu) {
      return;
    }

    event.preventDefault();

    const commandMenu = ui.querySelector(".fui-command");

    if (!commandMenu) {
      return;
    }

    commandMenu.tabIndex = 0;

    commandMenu.focus();

    commandMenu.classList.add("fui-ui-focused");
  };

  // Guarda o handler na própria HUD para poder
  // removê-lo corretamente depois.

  ui._fabulaKeydownHandler = keydownHandler;

  document.addEventListener("keydown", keydownHandler);

  // ===================================================
  // COMMAND MENU
  // ===================================================

  setupCommandMenu(ui);

  // ===================================================
  // INITIAL STATE
  // ===================================================

  updateActiveCombatant(game.combat, ui);

  updateCommandActor(currentActor, ui);
}

// =====================================================
// REFRESH UI
// =====================================================

function refreshFabulaUI(combat) {
  if (!combat?.active) {
    removeFabulaUI();
    return;
  }

  createFabulaUI();

  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  // ===================================================
  // ACTIVE COMBATANT
  // ===================================================
  //
  // Atualiza somente o personagem cujo turno está ativo.
  //
  // NÃO chama updateCommandActor().
  //
  // O personagem do Command Menu é independente
  // do combatant ativo.

  updateActiveCombatant(combat, ui);
}

// =====================================================
// FOUNDry READY
// =====================================================
Hooks.once("init", () => {
  registerHudSettings();
});

Hooks.once("ready", () => {
  console.log("Fabula JRPG UI | Ready");

  // Importante para players que entram/recarregam
  // enquanto um combate já está ativo.

  refreshFabulaUI(game.combat);
});

// =====================================================
// COMBAT START
// =====================================================

Hooks.on("combatStart", (combat) => {
  console.log("Fabula JRPG UI | Combat started");

  refreshFabulaUI(combat);
});

// =====================================================
// COMBAT UPDATES
// =====================================================
//
// Este hook atualiza somente o estado do turno.
//
// Ele NÃO altera o personagem controlado pelo
// Command Menu.
//

Hooks.on("updateCombat", (combat) => {
  refreshFabulaUI(combat);
});

// =====================================================
// ACTOR UPDATES
// =====================================================

Hooks.on("updateActor", (updatedActor) => {
  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
    return;
  }

  updateCharacterCard(updatedActor, ui);
});

// =====================================================
// TOKEN SELECTION
// =====================================================
//
// O Foundry chama este hook quando um Token é
// selecionado ou deselecionado no Canvas.
//
// O Command Actor é alterado SOMENTE aqui.
//

Hooks.on("controlToken", (token, controlled) => {
  // -------------------------------------------------
  // IGNORA DESELEÇÃO
  // -------------------------------------------------

  if (!controlled) {
    return;
  }

  // -------------------------------------------------
  // HUD
  // -------------------------------------------------

  const ui = document.querySelector("#fabula-jrpg-ui");

  if (!ui) {
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
  //
  // O Command Menu trabalha com personagens.
  //

  if (actor.type !== "character") {
    return;
  }

  // -------------------------------------------------
  // OWNERSHIP
  // -------------------------------------------------
  //
  // O player precisa ser OWNER do Actor.
  //
  // Isso impede que selecionar:
  //
  // - personagem de outro player
  // - NPC
  // - inimigo
  //
  // altere o Command Menu.

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
  //
  // Mais de um personagem próprio selecionado.
  //
  // Não escolhemos arbitrariamente um deles.

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

  // -------------------------------------------------
  // CLOSE ACTIVE SUBMENU
  // -------------------------------------------------
  //
  // Se o jogador estava em:
  //
  // Attack
  // Skill
  // Item
  // etc.
  //
  // e mudou de personagem no Canvas,
  // voltamos obrigatoriamente para o Command Menu.
  //

  closeActiveSubmenu(ui);

  // -------------------------------------------------
  // UPDATE COMMAND ACTOR
  // -------------------------------------------------

  console.log("Fabula JRPG UI | Command Actor alterado:", selectedActor.name);

  updateCommandActor(selectedActor, ui);
});

// =====================================================
// COMBAT END
// =====================================================

Hooks.on("deleteCombat", () => {
  removeFabulaUI();
});
