import { executeAction } from "./execute-action.js";
import { showMenu, hideMenu } from "./menu-utils.js";

export function openConfirmMenu({
  actor,
  action,
  actionType,
  targetIds,
  ui,
  previousMenu,
  positionRect,
}) {
  const previousRect = positionRect ?? previousMenu.getBoundingClientRect();

  hideMenu(previousMenu);

  const confirmMenu = document.createElement("div");

  confirmMenu.className = "fui-confirm-menu fui-submenu";

  const combatants = game.combat?.combatants.contents ?? [];

  const targets = targetIds
    .map((id) => combatants.find((combatant) => combatant.id === id))
    .filter((combatant) => combatant?.actor);

  const actionLabels = {
    attack: "Attack",
    skill: "Skill",
    item: "Item",
  };

  const actionLabel = actionLabels[actionType] ?? actionType.toUpperCase();

  confirmMenu.innerHTML = `
    <div class="fui-command-title">
      CONFIRM
    </div>

    <div class="fui-confirm-action">
      ${actionLabel} / ${action.name}
    </div>

    <div class="fui-confirm-targets-title">
      TARGETS
    </div>

    <div class="fui-confirm-targets">
      ${targets
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
        .join("")}
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

    <div class="fui-confirm-cursor"></div>
  `;

  ui.appendChild(confirmMenu);

  confirmMenu.tabIndex = 0;

  confirmMenu.style.position = "fixed";
  confirmMenu.style.left = `${previousRect.left}px`;
  confirmMenu.style.top = `${previousRect.top}px`;

  showMenu(confirmMenu);

  const buttons = confirmMenu.querySelectorAll(".fui-confirm-button");

  const cursor = confirmMenu.querySelector(".fui-confirm-cursor");

  let selectedIndex = 0;

  function updateCursor() {
    const button = buttons[selectedIndex];

    if (!button || !cursor) {
      return;
    }

    cursor.style.top = `${button.offsetTop + button.offsetHeight / 2 - 13}px`;

    cursor.style.height = `${button.offsetHeight}px`;
  }

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedIndex);
    });

    updateCursor();
  }

  function closeConfirmMenu() {
    hideMenu(confirmMenu);
    showMenu(previousMenu);
  }

  let isExecuting = false;

  async function executeConfirm() {
    if (isExecuting) {
      return;
    }

    const button = buttons[selectedIndex];

    if (!button) {
      return;
    }

    const confirmation = button.dataset.confirm;

    if (confirmation === "cancel") {
      closeConfirmMenu();
      return;
    }

    isExecuting = true;

    await executeAction({
      actor,
      action,
      actionType,
      targetIds,
      ui,
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      selectedIndex = index;

      updateSelection();

      executeConfirm();
    });
  });

  confirmMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      selectedIndex = (selectedIndex + 1) % buttons.length;

      updateSelection();

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;

      updateSelection();

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      executeConfirm();

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeConfirmMenu();

      return;
    }
  });

  updateSelection();

  requestAnimationFrame(() => {
    updateCursor();
  });
}
