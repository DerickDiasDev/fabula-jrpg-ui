import { showMenu, hideMenu, destroyCanvasCursor } from "./menu-utils.js";

import { executeAction } from "../actions/execute-action.js";

import { createHudCursor } from "../shared/hud-cursor.js";

import { playUISound } from "../shared/audio.js";

// =====================================================
// ACTION LABELS
// =====================================================

const ACTION_LABELS = {
  attack: "Attack",
  skill: "Skill",
  item: "Item",
};

// =====================================================
// TARGETS
// =====================================================

function getTargetCombatants(targetIds) {
  const combatants = game.combat?.combatants.contents ?? [];

  return targetIds
    .map((id) => combatants.find((combatant) => combatant.id === id))
    .filter((combatant) => combatant?.actor);
}

// =====================================================
// ACTION LABEL
// =====================================================

function getActionLabel(actionType) {
  return ACTION_LABELS[actionType] ?? actionType.toUpperCase();
}

// =====================================================
// TARGET HTML
// =====================================================

function createTargetHTML(targets) {
  return targets
    .map(
      (combatant) => `
        <div class="fui-confirm-target">
          <span class="fui-confirm-target-name">
            <span class="fui-confirm-target-name-inner">
              ${combatant.actor.name}
            </span>
          </span>
        </div>
      `,
    )
    .join("");
}

// =====================================================
// MENU HTML
// =====================================================

function createConfirmMenuHTML({ action, actionType, targets }) {
  const actionLabel = getActionLabel(actionType);

  return `
    <div class="fui-command-title">
      CONFIRM
    </div>

    <div class="fui-confirm-content">

      <div class="fui-confirm-action">
        ${actionLabel} / ${action.name}
      </div>

      <div class="fui-confirm-targets-title">
        TARGETS
      </div>

      <div class="fui-confirm-targets">
        ${createTargetHTML(targets)}
      </div>

      <div class="fui-confirm-buttons">
        <button
          class="fui-command-button fui-confirm-button fui-active"
          data-confirm="confirm"
        >
          Confirm
        </button>

        <button
          class="fui-command-button fui-confirm-button"
          data-confirm="cancel"
        >
          Cancel
        </button>
      </div>

    </div>
  `;
}

// =====================================================
// OPEN CONFIRM MENU
// =====================================================

export function openConfirmMenu({
  actor,
  action,
  actionType,
  targetIds,
  ui,
  previousMenu,
  positionRect,
  canvasCursor,
}) {
  // ===================================================
  // POSITION
  // ===================================================

  const previousRect = positionRect ?? previousMenu.getBoundingClientRect();

  hideMenu(previousMenu);

  // ===================================================
  // TARGETS
  // ===================================================

  const targets = getTargetCombatants(targetIds);

  // ===================================================
  // CREATE MENU
  // ===================================================

  const confirmMenu = document.createElement("div");

  confirmMenu.className = "fui-confirm-menu fui-submenu";

  confirmMenu.tabIndex = 0;

  confirmMenu.style.position = "fixed";
  confirmMenu.style.left = `${previousRect.left}px`;

  confirmMenu.style.top = `${previousRect.top}px`;

  confirmMenu.innerHTML = createConfirmMenuHTML({
    action,
    actionType,
    targets,
  });

  ui.appendChild(confirmMenu);

  showMenu(confirmMenu);

  // ===================================================
  // STATE
  // ===================================================

  const buttons = Array.from(
    confirmMenu.querySelectorAll(".fui-confirm-button"),
  );

  const cursor = createHudCursor(confirmMenu);

  let selectedIndex = 0;
  let isExecuting = false;

  // ===================================================
  // SELECTION
  // ===================================================

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedIndex);
    });

    cursor.update(buttons[selectedIndex]);
  }

  // ===================================================
  // CLOSE
  // ===================================================

  function closeConfirmMenu() {
    hideMenu(confirmMenu);

    destroyCanvasCursor(ui);

    showMenu(previousMenu);
  }

  // ===================================================
  // EXECUTE
  // ===================================================

  async function executeConfirm() {
    if (isExecuting) {
      return;
    }

    const button = buttons[selectedIndex];

    if (!button) {
      return;
    }

    const confirmation = button.dataset.confirm;

    // -----------------------------------------------
    // CANCEL
    // -----------------------------------------------

    if (confirmation === "cancel") {
      closeConfirmMenu();
      return;
    }

    // -----------------------------------------------
    // EXECUTE
    // -----------------------------------------------

    isExecuting = true;

    try {
      await executeAction({
        actor,
        action,
        actionType,
        targetIds,
        ui,
      });

      destroyCanvasCursor(ui);
    } finally {
      isExecuting = false;
    }
  }

  // ===================================================
  // BUTTONS
  // ===================================================

  buttons.forEach((button, index) => {
    button.addEventListener("mouseenter", () => {
      if (selectedIndex === index) {
        return;
      }

      selectedIndex = index;

      updateSelection();

      playUISound("navigate");
    });

    button.addEventListener("click", () => {
      selectedIndex = index;

      updateSelection();

      if (button.dataset.confirm === "cancel") {
        playUISound("cancel");
      } else {
        playUISound("confirm");
      }

      executeConfirm();
    });
  });

  // ===================================================
  // KEYBOARD
  // ===================================================

  confirmMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      if (buttons.length === 0) {
        return;
      }

      selectedIndex = (selectedIndex + 1) % buttons.length;

      updateSelection();

      playUISound("navigate");

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      if (buttons.length === 0) {
        return;
      }

      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;

      updateSelection();

      playUISound("navigate");

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("confirm");

      executeConfirm();

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("cancel");

      closeConfirmMenu();

      return;
    }
  });

  // ===================================================
  // INITIAL SELECTION
  // ===================================================

  updateSelection();

  requestAnimationFrame(() => {
    cursor.update(buttons[selectedIndex]);
  });
}
