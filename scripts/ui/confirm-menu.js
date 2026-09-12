import { executeAction } from "./execute-action.js";
import { showMenu, hideMenu } from "./menu-utils.js";

export function openConfirmMenu({
  actor,
  action,
  actionType,
  targetIds,
  ui,
  previousMenu,
}) {
  const previousRect = previousMenu.getBoundingClientRect();

  hideMenu(previousMenu);

  const confirmMenu = document.createElement("div");

  confirmMenu.className = "fabula-confirm-menu fabula-submenu";

  const combatants = game.combat?.combatants.contents ?? [];

  const targets = targetIds
    .map((id) => combatants.find((combatant) => combatant.id === id))
    .filter((combatant) => combatant?.actor);

  const actionLabel = actionType === "skill" ? "Skill" : "Attack";

  confirmMenu.innerHTML = `
    <div class="fabula-command-title">
        CONFIRM
    </div>

    <div class="confirm-action">
        ${actionLabel} / ${action.name}
    </div>

    <div class="confirm-targets-title">
        TARGETS
    </div>

    <div class="confirm-targets">
        ${targets
          .map(
            (combatant) => `
              <div class="confirm-target">
                  ${combatant.actor.name}
              </div>
            `,
          )
          .join("")}
    </div>

    <button
      class="fabula-command-button confirm-button active"
      data-confirm="confirm"
    >
      Confirm
    </button>

    <button
      class="fabula-command-button confirm-button"
      data-confirm="cancel"
    >
      Cancel
    </button>
  `;

  ui.appendChild(confirmMenu);

  confirmMenu.tabIndex = 0;

  confirmMenu.style.position = "fixed";
  confirmMenu.style.left = `${previousRect.left}px`;
  confirmMenu.style.top = `${previousRect.top}px`;

  showMenu(confirmMenu);

  const buttons = confirmMenu.querySelectorAll(".confirm-button");

  let selectedIndex = 0;

  function updateSelection() {
    buttons.forEach((button, index) => {
      button.classList.toggle("active", index === selectedIndex);
    });
  }

  function closeConfirmMenu() {
    hideMenu(confirmMenu);
    showMenu(previousMenu);
  }

  async function executeConfirm() {
    const button = buttons[selectedIndex];

    if (!button) return;

    const confirmation = button.dataset.confirm;

    if (confirmation === "cancel") {
      closeConfirmMenu();
      return;
    }

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
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;

      updateSelection();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      executeConfirm();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeConfirmMenu();
    }
  });

  updateSelection();
}
