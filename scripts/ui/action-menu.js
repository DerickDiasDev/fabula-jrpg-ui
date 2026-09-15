import { openTargetCountMenu } from "./target-menu.js";
import { showMenu, hideMenu, returnToCommand } from "./menu-utils.js";
import { createHudCursor } from "./hud-cursor.js";
import { playUISound } from "./audio.js";

export function openActionMenu({ actor, actions, actionType, ui }) {
  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) return;

  commandMenu.tabIndex = 0;

  const menuClass = `fui-${actionType}-menu`;
  const openClass = `fui-${actionType}-menu-open`;

  const existingMenu = ui.querySelector(`.${menuClass}`);

  if (existingMenu) {
    commandMenu.classList.add(openClass);
    commandMenu.classList.remove("fui-ui-focused");
    showMenu(existingMenu);
    return;
  }

  commandMenu.classList.add(openClass);
  commandMenu.classList.remove("fui-ui-focused");

  const actionMenu = document.createElement("div");
  actionMenu.className = `${menuClass} fui-action-menu fui-submenu`;

  const title = actionType.charAt(0).toUpperCase() + actionType.slice(1);

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
        ? `${amount} ${resource} / A`
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
    <div class="fui-command-title">
      ${title}
    </div>

    <div class="fui-action-subtitle">
      Select one :
    </div>

    <div class="fui-action-list">
      ${actions
        .map(
          (action, index) => `
            <button
              class="fui-command-button fui-action-button ${
                index === 0 ? "fui-active" : ""
              }"
              data-action-id="${action.id}"
            >
              <img
                class="fui-action-item-icon"
                src="${action.img}"
              />

              <span class="fui-action-name">
                <span class="fui-action-name-inner">${action.name}</span>
              </span>

              <span class="fui-action-cost">
                ${getActionCost(action)}
              </span>
            </button>
          `,
        )
        .join("")}
    </div>

    <div class="fui-action-scrollbar">
      <div
        class="fui-action-scrollbar-arrow fui-action-scrollbar-arrow-up"
      ></div>

      <div class="fui-action-scrollbar-track">
        <div class="fui-action-scrollbar-thumb"></div>
      </div>

      <div
        class="fui-action-scrollbar-arrow fui-action-scrollbar-arrow-down"
      ></div>
    </div>
  `;

  ui.appendChild(actionMenu);

  actionMenu.tabIndex = 0;

  const commandRect = commandMenu.getBoundingClientRect();

  actionMenu.style.position = "fixed";
  actionMenu.style.left = `${commandRect.right + 12}px`;
  actionMenu.style.top = `${commandRect.top}px`;

  showMenu(actionMenu);

  const actionList = actionMenu.querySelector(".fui-action-list");
  const actionButtons = actionMenu.querySelectorAll(".fui-action-button");

  const cursor = createHudCursor(actionMenu);

  const scrollbar = actionMenu.querySelector(".fui-action-scrollbar");

  const scrollbarTrack = actionMenu.querySelector(
    ".fui-action-scrollbar-track",
  );

  const scrollbarThumb = actionMenu.querySelector(
    ".fui-action-scrollbar-thumb",
  );

  let selectedAction = 0;

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

  function applyMarqueeIfNeeded(button) {
    const nameEl = button.querySelector(".fui-action-name");
    const innerEl = button.querySelector(".fui-action-name-inner");

    if (!nameEl || !innerEl) {
      return;
    }

    const overflow = innerEl.scrollWidth - nameEl.clientWidth;

    if (overflow <= 0) {
      clearMarquee(button);
      return;
    }

    const pixelsPerSecond = 40;
    const duration = Math.max(2, overflow / pixelsPerSecond + 1.5);

    innerEl.style.setProperty("--fui-marquee-distance", `-${overflow}px`);

    innerEl.style.setProperty("--fui-marquee-duration", `${duration}s`);

    button.classList.add("fui-marquee");
  }

  function clearMarquee(button) {
    const innerEl = button.querySelector(".fui-action-name-inner");

    button.classList.remove("fui-marquee");

    innerEl?.style.removeProperty("--fui-marquee-distance");
    innerEl?.style.removeProperty("--fui-marquee-duration");
  }

  function updateActionMarquee() {
    actionButtons.forEach((button) => {
      const shouldAnimate =
        button.classList.contains("fui-active") || button.matches(":hover");

      if (shouldAnimate) {
        applyMarqueeIfNeeded(button);
      } else {
        clearMarquee(button);
      }
    });
  }

  function updateActionSelection(shouldScroll = true) {
    actionButtons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedAction);
    });

    if (shouldScroll) {
      actionButtons[selectedAction]?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }

    cursor.update(actionButtons[selectedAction]);

    requestAnimationFrame(updateActionScrollbar);
    requestAnimationFrame(updateActionMarquee);
  }

  actionList?.addEventListener("scroll", () => {
    cursor.update(actionButtons[selectedAction]);
    updateActionScrollbar();
  });

  function closeActionMenu() {
    returnToCommand(ui);
  }

  function executeSelectedAction() {
    const button = actionButtons[selectedAction];

    if (!button) {
      return;
    }

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
      playUISound("confirm");
      executeSelectedAction();
    });

    button.addEventListener("mouseenter", () => {
      if (selectedAction === index) {
        applyMarqueeIfNeeded(button);
        return;
      }

      selectedAction = index;
      updateActionSelection(false);
      playUISound("navigate");
    });

    button.addEventListener("mouseleave", () => {
      if (!button.classList.contains("fui-active")) {
        clearMarquee(button);
      }
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
      playUISound("navigate");

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
      playUISound("navigate");

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("confirm");
      executeSelectedAction();

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("cancel");
      closeActionMenu();

      return;
    }
  });

  updateActionSelection();

  requestAnimationFrame(() => {
    updateActionScrollbar();
    cursor.update(actionButtons[selectedAction]);
  });
}
