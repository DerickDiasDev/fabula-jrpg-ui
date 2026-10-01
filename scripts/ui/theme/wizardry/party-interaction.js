import { getPartyMemberByActor } from "../../party/party-data.js";

import {
  updateCommandActor,
  getCommandActor,
} from "../../command/command-menu.js";

import { closeActiveSubmenu } from "../../menus/menu-utils.js";

import { syncTokenSelection } from "../../combat/token-selection.js";

import { addActorsToCombat } from "../../combat/combat-selection.js";

// =====================================================
// CHARACTER OWNERSHIP
// =====================================================

function canSelectCharacter(member) {
  const actor = member?.actor;

  if (!actor) {
    return false;
  }

  return actor.testUserPermission(game.user, "OWNER");
}

// =====================================================
// WIZARDRY PARTY INTERACTION
// =====================================================
//
// Configurada uma única vez por HUD. Os listeners ficam no
// container .fui-party-stats (que não é recriado) e no
// document, e a seleção sobrevive às re-renderizações dos
// cards. Após cada re-render, o hud-controller chama
// refreshWizardryPartyInteraction().
// =====================================================

export function setupWizardryPartyInteraction(ui) {
  const partyStats = ui?.querySelector(".fui-party-stats");

  if (!partyStats || partyStats._fabulaWizardryParty) {
    return;
  }

  const selectedMembers = new Map();

  // ===================================================
  // CARDS
  // ===================================================

  function getButtons() {
    return Array.from(
      partyStats.querySelectorAll(".fui-wizardry-character-card"),
    );
  }

  // ===================================================
  // UPDATE VISUAL SELECTION
  // ===================================================

  function updateVisualSelection() {
    getButtons().forEach((button) => {
      button.classList.toggle(
        "fui-wizardry-selected",
        selectedMembers.has(button.dataset.actorId),
      );
    });
  }

  // ===================================================
  // REFRESH AFTER RE-RENDER
  // ===================================================

  function refresh() {
    const renderedActorIds = new Set(
      getButtons().map((button) => button.dataset.actorId),
    );

    for (const actorId of selectedMembers.keys()) {
      if (!renderedActorIds.has(actorId)) {
        selectedMembers.delete(actorId);
      }
    }

    updateVisualSelection();
  }

  partyStats._fabulaWizardryParty = {
    refresh,
  };

  // ===================================================
  // SYNC FOUNDRY TOKENS
  // ===================================================

  function syncSelection() {
    syncTokenSelection(
      [...selectedMembers.values()].map((member) => member.actor),
    );
  }

  // ===================================================
  // SET ACTIVE COMMAND ACTOR
  // ===================================================

  // Um submenu aberto guarda o Actor de quando foi aberto,
  // então trocar de personagem fecha o fluxo em andamento.
  function setActiveMember(member) {
    if (!member?.actor) {
      return;
    }

    if (getCommandActor() === member.actor) {
      return;
    }

    closeActiveSubmenu(ui);
    updateCommandActor(member.actor, ui);
  }

  async function addSelectedToCombat() {
    const actors = [...selectedMembers.values()].map((member) => member.actor);

    if (actors.length === 0) {
      return;
    }

    await addActorsToCombat(actors);
  }

  // ===================================================
  // GET MEMBER
  // ===================================================

  function getMember(button) {
    const actor = game.actors.get(button.dataset.actorId);

    return getPartyMemberByActor(actor);
  }

  // ===================================================
  // CLICK SELECTION / ADD TO COMBAT
  // ===================================================

  partyStats.addEventListener("click", async (event) => {
    const addToCombatButton = event.target.closest(
      ".fui-wizardry-add-to-combat",
    );

    if (addToCombatButton) {
      event.preventDefault();
      event.stopPropagation();

      await addSelectedToCombat();

      return;
    }

    const button = event.target.closest(".fui-wizardry-character-card");

    if (!button) {
      return;
    }

    const member = getMember(button);

    if (!member) {
      return;
    }

    if (!canSelectCharacter(member)) {
      return;
    }

    const isMultiSelect = event.ctrlKey || event.metaKey;

    // -------------------------------------------------
    // NORMAL CLICK
    // -------------------------------------------------

    if (!isMultiSelect) {
      selectedMembers.clear();
      selectedMembers.set(member.actor.id, member);
    }

    // -------------------------------------------------
    // CTRL / CMD CLICK
    // -------------------------------------------------
    else {
      if (selectedMembers.has(member.actor.id)) {
        selectedMembers.delete(member.actor.id);
      } else {
        selectedMembers.set(member.actor.id, member);
      }
    }

    updateVisualSelection();
    syncSelection();

    // Ctrl+clique que desmarca não troca o ator do Command.
    if (selectedMembers.has(member.actor.id)) {
      setActiveMember(member);
    }
  });

  partyStats.addEventListener("dblclick", (event) => {
    const button = event.target.closest(".fui-wizardry-character-card");

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const member = getMember(button);
    if (!member?.actor) return;

    const canViewSheet = member.actor.testUserPermission(
      game.user,
      "OBSERVER",
    );

    if (!canViewSheet) return;

    member.actor.sheet?.render(true);
  });

  // ===================================================
  // DRAG SELECT
  // ===================================================

  let dragState = null;

  const DRAG_THRESHOLD = 4;

  function createSelectionBox() {
    const box = document.createElement("div");

    box.className = "fui-wizardry-selection-box";

    document.body.appendChild(box);

    return box;
  }

  function updateSelectionBox(box, startX, startY, currentX, currentY) {
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
  }

  function rectanglesIntersect(rectA, rectB) {
    return (
      rectA.left < rectB.right &&
      rectA.right > rectB.left &&
      rectA.top < rectB.bottom &&
      rectA.bottom > rectB.top
    );
  }

  function finishDragSelect() {
    if (!dragState) {
      return;
    }

    const { box, startX, startY, currentX, currentY, additive } = dragState;

    const selectionRect = {
      left: Math.min(startX, currentX),
      right: Math.max(startX, currentX),
      top: Math.min(startY, currentY),
      bottom: Math.max(startY, currentY),
    };

    // -------------------------------------------------
    // NORMAL DRAG REPLACES SELECTION
    // -------------------------------------------------

    if (!additive) {
      selectedMembers.clear();
    }

    // -------------------------------------------------
    // FIND BUTTONS INSIDE SELECTION
    // -------------------------------------------------

    let lastSelectedMember = null;

    getButtons().forEach((button) => {
      const member = getMember(button);

      if (!member) {
        return;
      }

      if (!canSelectCharacter(member)) {
        return;
      }

      const buttonRect = button.getBoundingClientRect();

      if (rectanglesIntersect(selectionRect, buttonRect)) {
        selectedMembers.set(member.actor.id, member);

        lastSelectedMember = member;
      }
    });

    updateVisualSelection();

    syncSelection();

    if (lastSelectedMember) {
      setActiveMember(lastSelectedMember);
    }

    box.remove();

    dragState = null;

    document.body.style.userSelect = "";
  }

  partyStats.addEventListener("pointerdown", (event) => {
    // -------------------------------------------------
    // ONLY LEFT MOUSE BUTTON
    // -------------------------------------------------

    if (event.button !== 0) {
      return;
    }

    // -------------------------------------------------
    // ONLY WHILE THE WIZARDRY PARTY IS RENDERED
    // -------------------------------------------------
    //
    // .fui-wizardry-party tem pointer-events: none, então
    // nas áreas vazias o alvo do evento é o próprio
    // .fui-party-stats, e não um elemento dentro da Party.
    // -------------------------------------------------

    if (!partyStats.querySelector(".fui-wizardry-party")) {
      return;
    }

    // No modo de edição do HUD, arrastar move a Party.
    if (ui.classList.contains("fui-hud-editing")) {
      return;
    }

    // -------------------------------------------------
    // DON'T START DRAG ON A CHARACTER OR BUTTON
    // -------------------------------------------------

    if (
      event.target.closest(
        ".fui-wizardry-character-card, .fui-wizardry-add-to-combat",
      )
    ) {
      return;
    }

    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      additive: event.ctrlKey || event.metaKey,
      box: null,
      dragging: false,
    };

    document.body.style.userSelect = "none";
  });

  document.addEventListener("pointermove", (event) => {
    if (!dragState) {
      return;
    }

    dragState.currentX = event.clientX;
    dragState.currentY = event.clientY;

    const deltaX = event.clientX - dragState.startX;

    const deltaY = event.clientY - dragState.startY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // -------------------------------------------------
    // WAIT FOR ACTUAL DRAG
    // -------------------------------------------------

    if (!dragState.dragging && distance < DRAG_THRESHOLD) {
      return;
    }

    // -------------------------------------------------
    // CREATE SELECTION BOX
    // -------------------------------------------------

    if (!dragState.dragging) {
      dragState.dragging = true;
      dragState.box = createSelectionBox();
    }

    updateSelectionBox(
      dragState.box,
      dragState.startX,
      dragState.startY,
      dragState.currentX,
      dragState.currentY,
    );
  });

  document.addEventListener("pointerup", (event) => {
    if (!dragState) {
      return;
    }

    dragState.currentX = event.clientX;
    dragState.currentY = event.clientY;

    if (dragState.dragging) {
      finishDragSelect();
      return;
    }

    // -------------------------------------------------
    // NO DRAG
    // -------------------------------------------------

    document.body.style.userSelect = "";

    dragState = null;
  });
}

// =====================================================
// REFRESH AFTER RE-RENDER
// =====================================================

export function refreshWizardryPartyInteraction(ui) {
  const partyStats = ui?.querySelector(".fui-party-stats");

  partyStats?._fabulaWizardryParty?.refresh();
}
