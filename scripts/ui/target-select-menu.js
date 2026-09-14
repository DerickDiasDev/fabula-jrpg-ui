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

  const isCommandMenu = previousMenu.classList.contains("fui-command");

  if (!isCommandMenu) {
    hideMenu(previousMenu);
  }

  const targetMenu = document.createElement("div");

  targetMenu.className = "fui-target-select-menu fui-submenu";

  const combatants = game.combat?.combatants.contents ?? [];

  const party = combatants.filter(
    (combatant) => combatant.actor?.type === "character",
  );

  const enemies = combatants.filter(
    (combatant) => combatant.actor?.type !== "character",
  );

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
      TARGET
    </div>

    <div class="fui-target-action">
      ${actionLabel}${action ? ` / ${action.name}` : ""}
    </div>

    <div class="fui-target-list">

      <div class="fui-target-group">
        <div class="fui-target-group-title">
          PARTY
        </div>

        ${party
          .map(
            (combatant) => `
              <button
                class="fui-command-button fui-target-button"
                data-combatant-id="${combatant.id}"
              >
                <span class="fui-target-name">
                  <span class="fui-target-name-inner">
                    ${combatant.actor?.name ?? "Unknown"}
                  </span>
                </span>
              </button>
            `,
          )
          .join("")}
      </div>

      <div class="fui-target-group">
        <div class="fui-target-group-title">
          ENEMIES
        </div>

        ${enemies
          .map(
            (combatant) => `
              <button
                class="fui-command-button fui-target-button"
                data-combatant-id="${combatant.id}"
              >
                <span class="fui-target-name">
                  <span class="fui-target-name-inner">
                    ${combatant.actor?.name ?? "Unknown"}
                  </span>
                </span>
              </button>
            `,
          )
          .join("")}
      </div>

    </div>

    <div class="fui-target-count">
      Selected: 0/${targetCount}
    </div>

    <div class="fui-target-scrollbar">
      <div class="fui-target-scrollbar-arrow fui-target-scrollbar-arrow-up"></div>

      <div class="fui-target-scrollbar-track">
        <div class="fui-target-scrollbar-thumb"></div>
      </div>

      <div class="fui-target-scrollbar-arrow fui-target-scrollbar-arrow-down"></div>
    </div>

    <div class="fui-target-cursor"></div>
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

  const targetList = targetMenu.querySelector(".fui-target-list");
  const targetButtons = targetMenu.querySelectorAll(".fui-target-button");
  const targetCursor = targetMenu.querySelector(".fui-target-cursor");

  const scrollbar = targetMenu.querySelector(".fui-target-scrollbar");
  const scrollbarTrack = targetMenu.querySelector(
    ".fui-target-scrollbar-track",
  );
  const scrollbarThumb = targetMenu.querySelector(
    ".fui-target-scrollbar-thumb",
  );

  let selectedIndex = 0;

  const selectedTargets = new Set();

  function updateTargetCursor() {
    const button = targetButtons[selectedIndex];

    if (!button || !targetCursor || !targetList) {
      return;
    }

    const top = targetList.offsetTop + button.offsetTop - targetList.scrollTop;

    targetCursor.style.top = `${top}px`;
    targetCursor.style.height = `${button.offsetHeight}px`;
  }

  function updateTargetScrollbar() {
    if (!targetList || !scrollbar || !scrollbarTrack || !scrollbarThumb) {
      return;
    }

    const scrollHeight = targetList.scrollHeight;
    const visibleHeight = targetList.clientHeight;

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

    const thumbTop = (targetList.scrollTop / maxScrollTop) * maxThumbTop;

    scrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
  }

  function applyMarqueeIfNeeded(button) {
    const nameEl = button.querySelector(".fui-target-name");
    const innerEl = button.querySelector(".fui-target-name-inner");

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

    innerEl.style.setProperty(
      "--fui-target-marquee-distance",
      `-${overflow}px`,
    );

    innerEl.style.setProperty("--fui-target-marquee-duration", `${duration}s`);

    button.classList.add("fui-marquee");
  }

  function clearMarquee(button) {
    const innerEl = button.querySelector(".fui-target-name-inner");

    button.classList.remove("fui-marquee");

    innerEl?.style.removeProperty("--fui-target-marquee-distance");

    innerEl?.style.removeProperty("--fui-target-marquee-duration");
  }

  function updateTargetMarquee() {
    targetButtons.forEach((button) => {
      const shouldAnimate =
        button.classList.contains("fui-active") || button.matches(":hover");

      if (shouldAnimate) {
        applyMarqueeIfNeeded(button);
      } else {
        clearMarquee(button);
      }
    });
  }

  function updateSelection() {
    targetButtons.forEach((button, index) => {
      button.classList.toggle("fui-active", index === selectedIndex);
    });

    targetButtons[selectedIndex]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });

    updateTargetCursor();

    requestAnimationFrame(updateTargetScrollbar);
    requestAnimationFrame(updateTargetMarquee);
  }

  function updateSelectedTargets() {
    targetButtons.forEach((button) => {
      const selected = selectedTargets.has(button.dataset.combatantId);

      button.classList.toggle("fui-selected", selected);
    });

    const counter = targetMenu.querySelector(".fui-target-count");

    if (counter) {
      counter.textContent = `Selected: ${selectedTargets.size}/${targetCount}`;
    }
  }

  targetList?.addEventListener("scroll", () => {
    updateTargetCursor();
    updateTargetScrollbar();
  });

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

    if (!button) {
      return;
    }

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
      previousMenu.classList.add("fui-ui-focused");
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

    button.addEventListener("mouseenter", () => {
      applyMarqueeIfNeeded(button);
    });

    button.addEventListener("mouseleave", () => {
      if (!button.classList.contains("fui-active")) {
        clearMarquee(button);
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

      return;
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

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      selectTarget();

      if (selectedTargets.size === targetCount) {
        openConfirmation();
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeTargetSelectMenu();

      return;
    }
  });

  updateSelection();
  updateSelectedTargets();

  requestAnimationFrame(() => {
    updateTargetScrollbar();
    updateTargetCursor();
    updateTargetMarquee();
  });
}
