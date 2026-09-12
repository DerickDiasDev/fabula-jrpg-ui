import { openTargetSelectMenu } from "./target-select-menu.js";
import { showMenu, hideMenu, getActiveSubmenu } from "./menu-utils.js";

export function openTargetCountMenu({ actor, action, actionType, ui }) {
  const previousMenu =
    getActiveSubmenu(ui) || ui.querySelector(".fabula-command");

  if (!previousMenu) return;

  // Captura a posição ANTES de esconder o menu anterior.
  const previousRect = previousMenu.getBoundingClientRect();

  hideMenu(previousMenu);

  const targetMenu = document.createElement("div");

  targetMenu.className = "fabula-target-menu fabula-submenu";

  const actionLabel =
    actionType === "skill"
      ? "Skill"
      : actionType === "item"
        ? "Item"
        : actionType === "study"
          ? "Study"
          : "Attack";

  targetMenu.innerHTML = `
    <div class="fabula-command-title">
        TARGET
    </div>

    <div class="target-action">
        ${actionLabel}${action ? ` / ${action.name}` : ""}
    </div>

    <button
        class="fabula-command-button target-count-button active"
        data-count="1"
    >
        1
    </button>

    <button
        class="fabula-command-button target-count-button"
        data-count="2"
    >
        2
    </button>

    <button
        class="fabula-command-button target-count-button"
        data-count="3"
    >
        3
    </button>

    <button
        class="fabula-command-button target-count-button"
        data-count="4"
    >
        4
    </button>

    <button
        class="fabula-command-button target-count-button"
        data-count="5"
    >
        5
    </button>
  `;

  ui.appendChild(targetMenu);

  targetMenu.tabIndex = 0;

  targetMenu.style.position = "fixed";
  targetMenu.style.left = `${previousRect.left}px`;
  targetMenu.style.top = `${previousRect.top}px`;

  showMenu(targetMenu);

  const buttons = targetMenu.querySelectorAll(".target-count-button");

  let selectedCount = 1;

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.classList.toggle("active", index === selectedCount - 1);
    });
  }

  function closeTargetCountMenu() {
    hideMenu(targetMenu);
    showMenu(previousMenu);
  }

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

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCount = Number(button.dataset.count);

      updateSelection();
      confirmTargetCount();
    });
  });

  targetMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      selectedCount = (selectedCount % buttons.length) + 1;

      updateSelection();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      selectedCount =
        ((selectedCount - 2 + buttons.length) % buttons.length) + 1;

      updateSelection();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      confirmTargetCount();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeTargetCountMenu();
    }
  });

  updateSelection();
}
