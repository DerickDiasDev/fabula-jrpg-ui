import { openTargetCountMenu } from "./target-menu.js";
import { showMenu, hideMenu } from "./menu-utils.js";

export function openActionMenu({ actor, actions, actionType, ui }) {
  const commandMenu = ui.querySelector(".fabula-command");

  if (!commandMenu) return;

  commandMenu.tabIndex = 0;

  const menuClass = `fabula-${actionType}-menu`;

  const openClass = `${actionType}-menu-open`;

  const existingMenu = ui.querySelector(`.${menuClass}`);

  /*
   * Se o menu já existe, apenas mostra novamente.
   */
  if (existingMenu) {
    commandMenu.classList.add(openClass);

    commandMenu.classList.remove("ui-focused");

    showMenu(existingMenu);

    return;
  }

  commandMenu.classList.add(openClass);

  commandMenu.classList.remove("ui-focused");

  const actionMenu = document.createElement("div");

  actionMenu.className = `${menuClass} fabula-action-menu fabula-submenu`;

  const title = actionType.toUpperCase();

  function getActionCost(action) {
    if (actionType === "skill") {
      const cost = action.system.cost;

      if (!cost) {
        return "";
      }

      const amount = cost.amount;

      const resource = cost.resource?.toUpperCase();

      if (amount == null || !resource) {
        return "";
      }

      return cost.perTarget
        ? `${amount} ${resource} / alvo`
        : `${amount} ${resource}`;
    }

    if (actionType === "item") {
      const ipCost = action.system.ipCost?.value;

      if (ipCost == null) {
        return "";
      }

      return `${ipCost} IP`;
    }

    return "";
  }

  actionMenu.innerHTML = `
    <div class="fabula-command-title">
      ${title}
    </div>

    ${actions
      .map((action, index) => {
        const cost = getActionCost(action);

        return `
            <button
              class="action-button ${index === 0 ? "active" : ""}"
              data-action-id="${action.id}"
            >
              <img
                class="action-item-icon"
                src="${action.img}"
                alt=""
              >

              <span class="action-name">
                ${action.name}
              </span>

              ${
                cost
                  ? `
                    <span class="action-cost">
                      ${cost}
                    </span>
                  `
                  : ""
              }
            </button>
          `;
      })
      .join("")}
  `;

  ui.appendChild(actionMenu);

  actionMenu.tabIndex = 0;

  /*
   * Posiciona o submenu ao lado do COMMAND.
   */
  const commandRect = commandMenu.getBoundingClientRect();

  actionMenu.style.position = "fixed";

  actionMenu.style.left = `${commandRect.right + 12}px`;

  actionMenu.style.top = `${commandRect.top}px`;

  showMenu(actionMenu);

  const actionButtons = actionMenu.querySelectorAll(".action-button");

  let selectedAction = 0;

  function updateActionSelection() {
    actionButtons.forEach((button, index) => {
      button.classList.toggle("active", index === selectedAction);
    });
  }

  function closeActionMenu() {
    hideMenu(actionMenu);

    commandMenu.classList.remove(openClass);

    commandMenu.classList.add("ui-focused");

    commandMenu.focus();
  }

  function executeSelectedAction() {
    const button = actionButtons[selectedAction];

    if (!button) return;

    const actionId = button.dataset.actionId;

    const action = actor.items.get(actionId);

    if (!action) {
      console.log(`${title}: ação não encontrada.`);
      return;
    }

    openTargetCountMenu({
      actor,
      action,
      actionType,
      ui,
    });
  }

  actionButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      selectedAction = index;

      updateActionSelection();

      executeSelectedAction();
    });
  });

  actionMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      if (actionButtons.length === 0) {
        return;
      }

      selectedAction = (selectedAction + 1) % actionButtons.length;

      updateActionSelection();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      if (actionButtons.length === 0) {
        return;
      }

      selectedAction =
        (selectedAction - 1 + actionButtons.length) % actionButtons.length;

      updateActionSelection();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      executeSelectedAction();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeActionMenu();
    }
  });

  updateActionSelection();
}
