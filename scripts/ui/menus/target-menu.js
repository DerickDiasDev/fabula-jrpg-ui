import { openTargetSelectMenu } from "./target-select-menu.js";
import { showMenu, hideMenu, getActiveSubmenu } from "./menu-utils.js";
import { createHudCursor } from "../shared/hud-cursor.js";
import { playUISound } from "../shared/audio.js";

export function openTargetCountMenu({ actor, action, actionType, ui }) {
  const previousMenu = getActiveSubmenu(ui) || ui.querySelector(".fui-command");

  if (!previousMenu) {
    return;
  }

  // =====================================================
  // CREATE TARGET MENU
  // =====================================================

  const previousRect = previousMenu.getBoundingClientRect();

  hideMenu(previousMenu);

  const targetMenu = document.createElement("div");

  targetMenu.className = "fui-target-menu fui-submenu";
  targetMenu.tabIndex = 0;

  targetMenu.style.position = "fixed";
  targetMenu.style.left = `${previousRect.left}px`;
  targetMenu.style.top = `${previousRect.top}px`;

  const actionLabel =
    actionType === "skill"
      ? "Skill"
      : actionType === "item"
        ? "Item"
        : actionType === "study"
          ? "Study"
          : "Attack";

  targetMenu.innerHTML = `
    <div class="fui-command-title">
      Target
    </div>

    <div class="fui-target-action">
      ${actionLabel}${action ? ` / ${action.name}` : ""}
    </div>

    <button
      class="fui-command-button fui-target-count-button fui-active"
      data-count="1"
    >
      1
    </button>

    <button
      class="fui-command-button fui-target-count-button"
      data-count="2"
    >
      2
    </button>

    <button
      class="fui-command-button fui-target-count-button"
      data-count="3"
    >
      3
    </button>

    <button
      class="fui-command-button fui-target-count-button"
      data-count="4"
    >
      4
    </button>

    <button
      class="fui-command-button fui-target-count-button"
      data-count="5"
    >
      5
    </button>
  `;

  ui.appendChild(targetMenu);
  showMenu(targetMenu);

  // =====================================================
  // STATE
  // =====================================================

  const buttons = targetMenu.querySelectorAll(".fui-target-count-button");

  const cursor = createHudCursor(targetMenu);

  let selectedCount = 1;

  // =====================================================
  // UPDATE SELECTION
  // =====================================================

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedCount - 1);
    });

    cursor.update(buttons[selectedCount - 1]);
  }

  // =====================================================
  // CLOSE
  // =====================================================

  function closeTargetCountMenu() {
    hideMenu(targetMenu);
    showMenu(previousMenu);
  }

  // =====================================================
  // CONFIRM
  // =====================================================

  function confirmTargetCount() {
    openTargetSelectMenu({
      actor,
      action,
      actionType,
      targetCount: selectedCount,
      ui,
      previousMenu: targetMenu,
    });
  }

  // =====================================================
  // MOUSE
  // =====================================================

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      const newCount = Number(button.dataset.count);

      if (selectedCount === newCount) {
        return;
      }

      selectedCount = newCount;

      updateSelection();

      playUISound("navigate");
    });

    button.addEventListener("click", () => {
      selectedCount = Number(button.dataset.count);

      updateSelection();

      playUISound("confirm");

      confirmTargetCount();
    });
  });

  // =====================================================
  // KEYBOARD
  // =====================================================

  targetMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      selectedCount = (selectedCount % buttons.length) + 1;

      updateSelection();

      playUISound("navigate");
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      selectedCount =
        ((selectedCount - 2 + buttons.length) % buttons.length) + 1;

      updateSelection();

      playUISound("navigate");
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("confirm");

      confirmTargetCount();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("cancel");

      closeTargetCountMenu();
    }
  });

  // =====================================================
  // INITIAL SELECTION
  // =====================================================

  updateSelection();

  requestAnimationFrame(() => {
    cursor.update(buttons[selectedCount - 1]);
  });
}
