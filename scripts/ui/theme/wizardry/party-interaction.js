import { getPartyMembers } from "../../party/party-data.js";

import { updateCommandActor } from "../../command/command-menu.js";

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

export function setupWizardryPartyInteraction(ui) {
  if (!ui) {
    return;
  }

  const party = ui.querySelector(".fui-wizardry-party");

  if (!party) {
    return;
  }

  const partyMembers = getPartyMembers();

  const buttons = Array.from(
    party.querySelectorAll(".fui-wizardry-party-member"),
  );

  const addToCombatButton = party.querySelector(".fui-wizardry-add-to-combat");

  const selectedMembers = new Map();

  // ===================================================
  // UPDATE VISUAL SELECTION
  // ===================================================

  function updateVisualSelection() {
    buttons.forEach((button) => {
      button.classList.toggle(
        "fui-wizardry-selected",
        selectedMembers.has(button.dataset.actorId),
      );
    });
  }

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

  function setActiveMember(member) {
    if (!member?.actor) {
      return;
    }

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
    const actorId = button.dataset.actorId;

    return (
      partyMembers.find((partyMember) => partyMember.actor.id === actorId) ??
      null
    );
  }

  // ===================================================
  // CLICK SELECTION
  // ===================================================

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
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

      setActiveMember(member);
    });
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

    buttons.forEach((button) => {
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

    addToCombatButton?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      await addSelectedToCombat();
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

  party.addEventListener("pointerdown", (event) => {
    // -------------------------------------------------
    // ONLY LEFT MOUSE BUTTON
    // -------------------------------------------------

    if (event.button !== 0) {
      return;
    }

    // -------------------------------------------------
    // DON'T START DRAG ON A CHARACTER
    // -------------------------------------------------

    if (event.target.closest(".fui-wizardry-party-member")) {
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
