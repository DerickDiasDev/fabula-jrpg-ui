import { openConfirmMenu } from "./confirm-menu.js";
import { showMenu, hideMenu } from "./menu-utils.js";
import { executeAction } from "./execute-action.js";

export function openTargetSelectMenu({
  actor,
  action,
  actionType,
  targetCount,
  ui,
  previousMenu,
}) {
  const previousRect = previousMenu.getBoundingClientRect();

  const isCommandMenu = previousMenu.classList.contains("fabula-command");

  if (!isCommandMenu) {
    hideMenu(previousMenu);
  }

  const targetMenu = document.createElement("div");

  targetMenu.className = "fabula-target-select-menu fabula-submenu";

  const combatants = game.combat?.combatants.contents ?? [];

  const party = combatants.filter(
    (combatant) => combatant.actor?.type === "character",
  );

  const enemies = combatants.filter(
    (combatant) => combatant.actor?.type !== "character",
  );

  targetMenu.innerHTML = `
    <div class="fabula-command-title">
        TARGET
    </div>

    <div class="target-action">
       ${
         actionType === "skill"
           ? "Skill"
           : actionType === "item"
             ? "Item"
             : actionType === "study"
               ? "Study"
               : "Attack"
       }${action ? ` / ${action.name}` : ""}
    </div>

    <div class="target-group">
        <div class="target-group-title">
            PARTY
        </div>

        ${party
          .map(
            (combatant) => `
              <button
                class="fabula-command-button target-button"
                data-combatant-id="${combatant.id}"
              >
                <span>
                  ${combatant.actor?.name ?? "Unknown"}
                </span>
              </button>
            `,
          )
          .join("")}
    </div>

    <div class="target-group">
        <div class="target-group-title">
            ENEMIES
        </div>

        ${enemies
          .map(
            (combatant) => `
              <button
                class="fabula-command-button target-button"
                data-combatant-id="${combatant.id}"
              >
                <span>
                  ${combatant.actor?.name ?? "Unknown"}
                </span>
              </button>
            `,
          )
          .join("")}
    </div>

    <div class="target-count">
        Selected: 0/${targetCount}
    </div>
  `;

  ui.appendChild(targetMenu);

  targetMenu.tabIndex = 0;

  targetMenu.style.position = "fixed";

  if (isCommandMenu) {
    targetMenu.style.left = `${previousRect.right + 12}px`;
    targetMenu.style.top = `${previousRect.top}px`;
  } else {
    targetMenu.style.left = `${previousRect.left}px`;
    targetMenu.style.top = `${previousRect.top}px`;
  }

  showMenu(targetMenu);

  const targetButtons = targetMenu.querySelectorAll(".target-button");

  let selectedIndex = 0;

  const selectedTargets = new Set();

  function updateSelection() {
    targetButtons.forEach((button, index) => {
      button.classList.toggle("active", index === selectedIndex);
    });
  }

  function updateSelectedTargets() {
    targetButtons.forEach((button) => {
      const selected = selectedTargets.has(button.dataset.combatantId);

      button.classList.toggle("selected", selected);
    });

    const counter = targetMenu.querySelector(".target-count");

    if (counter) {
      counter.textContent = `Selected: ${selectedTargets.size}/${targetCount}`;
    }
  }

  let isTransitioning = false;

  function openConfirmation() {
    if (isTransitioning) {
      return;
    }

    isTransitioning = true;

    if (actionType === "study") {
      executeAction({
        actor,
        action,
        actionType,
        targetIds: [...selectedTargets],
        ui,
      });

      return;
    }

    openConfirmMenu({
      actor,
      action,
      actionType,
      targetIds: [...selectedTargets],
      ui,
      previousMenu: targetMenu,
    });
  }

  function selectTarget() {
    const button = targetButtons[selectedIndex];

    if (!button) return;

    const combatantId = button.dataset.combatantId;

    if (selectedTargets.has(combatantId)) {
      selectedTargets.delete(combatantId);
    } else {
      if (selectedTargets.size >= targetCount) {
        return;
      }

      selectedTargets.add(combatantId);
    }

    updateSelectedTargets();
  }

  function closeTargetSelectMenu() {
    hideMenu(targetMenu);

    if (isCommandMenu) {
      previousMenu.classList.add("ui-focused");
      previousMenu.tabIndex = 0;
      previousMenu.focus();
      return;
    }

    showMenu(previousMenu);
  }

  targetButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      selectedIndex = index;

      selectTarget();

      updateSelection();

      if (selectedTargets.size === targetCount) {
        openConfirmation();
      }
    });
  });

  targetMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      if (targetButtons.length === 0) {
        return;
      }

      selectedIndex = (selectedIndex + 1) % targetButtons.length;

      updateSelection();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      if (targetButtons.length === 0) {
        return;
      }

      selectedIndex =
        (selectedIndex - 1 + targetButtons.length) % targetButtons.length;

      updateSelection();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      selectTarget();

      if (selectedTargets.size === targetCount) {
        openConfirmation();
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeTargetSelectMenu();
    }
  });

  updateSelection();

  updateSelectedTargets();
}
