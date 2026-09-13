import { openTargetCountMenu } from "./target-menu.js";
import { showMenu, hideMenu, returnToCommand } from "./menu-utils.js";

export function openActionMenu({ actor, actions, actionType, ui }) {
  const commandMenu = ui.querySelector(".fabula-command");

  if (!commandMenu) return;

  commandMenu.tabIndex = 0;

  const menuClass = `fabula-${actionType}-menu`;
  const openClass = `${actionType}-menu-open`;
  const existingMenu = ui.querySelector(`.${menuClass}`);

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

  const title = actionType.charAt(0).toUpperCase() + actionType.slice(1);

  actionMenu.innerHTML = `
    <div class="fabula-command-title">
      ${title}
    </div>

    <div class="action-subtitle">
      Selecione um
    </div>

    <div class="action-list">
      ${actions
        .map(
          (action, index) => `
            <button
              class="fabula-command-button action-button ${
                index === 0 ? "active" : ""
              }"
              data-action-id="${action.id}"
            >
              <img
                class="action-item-icon"
                src="${action.img}"
              />

              <span class="action-name">
                ${action.name}
              </span>

              <span class="action-cost">
                ${action.system.cost?.amount ?? ""}
              </span>
            </button>
          `,
        )
        .join("")}
    </div>

    <div class="action-scrollbar">
      <div
        class="action-scrollbar-arrow action-scrollbar-arrow-up"
      ></div>

      <div class="action-scrollbar-track">
        <div class="action-scrollbar-thumb"></div>
      </div>

      <div
        class="action-scrollbar-arrow action-scrollbar-arrow-down"
      ></div>
    </div>

    <div class="action-cursor"></div>
  `;

  ui.appendChild(actionMenu);

  actionMenu.tabIndex = 0;

  const commandRect = commandMenu.getBoundingClientRect();

  actionMenu.style.position = "fixed";
  actionMenu.style.left = `${commandRect.right + 12}px`;
  actionMenu.style.top = `${commandRect.top}px`;

  showMenu(actionMenu);

  const actionList = actionMenu.querySelector(".action-list");
  const actionCursor = actionMenu.querySelector(".action-cursor");
  const actionButtons = actionMenu.querySelectorAll(".action-button");

  const scrollbar = actionMenu.querySelector(".action-scrollbar");
  const scrollbarTrack = actionMenu.querySelector(".action-scrollbar-track");
  const scrollbarThumb = actionMenu.querySelector(".action-scrollbar-thumb");

  let selectedAction = 0;

  function updateActionCursor() {
    const button = actionButtons[selectedAction];

    if (!button || !actionCursor || !actionList) {
      return;
    }

    const top = actionList.offsetTop + button.offsetTop - actionList.scrollTop;

    actionCursor.style.top = `${top}px`;
    actionCursor.style.height = `${button.offsetHeight}px`;
  }

  function updateActionScrollbar() {
    if (!actionList || !scrollbar || !scrollbarTrack || !scrollbarThumb) {
      return;
    }

    const scrollHeight = actionList.scrollHeight;
    const visibleHeight = actionList.clientHeight;

    if (scrollHeight <= visibleHeight) {
      scrollbar.style.opacity = "0";
      return;
    }

    scrollbar.style.opacity = "";

    const trackHeight = scrollbarTrack.clientHeight;

    const thumbHeight = Math.max(
      20,
      (visibleHeight / scrollHeight) * trackHeight,
    );

    scrollbarThumb.style.height = `${thumbHeight}px`;

    const maxThumbTop = trackHeight - thumbHeight;
    const maxScrollTop = scrollHeight - visibleHeight;

    const thumbTop = (actionList.scrollTop / maxScrollTop) * maxThumbTop;

    scrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
  }

  function updateActionSelection() {
    actionButtons.forEach((button, index) => {
      button.classList.toggle("active", index === selectedAction);
    });

    actionButtons[selectedAction]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });

    updateActionCursor();

    requestAnimationFrame(updateActionScrollbar);
  }

  actionList?.addEventListener("scroll", () => {
    updateActionCursor();
    updateActionScrollbar();
  });

  function closeActionMenu() {
    returnToCommand(ui);
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
      return;
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
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      executeSelectedAction();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeActionMenu();
      return;
    }
  });

  updateActionSelection();

  requestAnimationFrame(() => {
    updateActionScrollbar();
    updateActionCursor();
  });
}
