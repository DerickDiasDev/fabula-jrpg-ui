import { openConfirmMenu } from "./confirm-menu.js";

import {
  showMenu,
  hideMenu,
  setCanvasCursor,
  destroyCanvasCursor,
} from "./menu-utils.js";

import { executeAction } from "../actions/execute-action.js";

import { createHudCursor } from "../shared/hud-cursor.js";

import { createCanvasCursor } from "../shared/canvas-cursor.js";

import { playUISound } from "../shared/audio.js";

// =====================================================
// TARGET GROUPS
// =====================================================

function getCombatantGroups() {
  const combatants = game.combat?.combatants.contents ?? [];

  const party = combatants.filter(
    (combatant) => combatant.actor?.type === "character",
  );

  const enemies = combatants.filter((combatant) => {
    const actor = combatant.actor;

    if (actor?.type === "character") {
      return false;
    }

    return !actor?.statuses?.has("ko");
  });

  return {
    party,
    enemies,
  };
}

// =====================================================
// ACTION LABEL
// =====================================================

function getActionLabel(actionType) {
  if (actionType === "skill") {
    return "Skill";
  }

  if (actionType === "item") {
    return "Item";
  }

  if (actionType === "study") {
    return "Study";
  }

  return "Attack";
}

// =====================================================
// TARGET BUTTON
// =====================================================

function createTargetButton(combatant) {
  return `
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
  `;
}

// =====================================================
// TARGET GROUP
// =====================================================

function createTargetGroup(id, label, combatants) {
  return `
    <div
      class="fui-target-group"
      data-target-group="${id}"
    >
      <div class="fui-target-group-title">
        <span class="fui-target-group-arrow fui-target-group-arrow-left">
          ◀
        </span>

        <span class="fui-target-group-title-text">
          ${label}
        </span>

        <span class="fui-target-group-arrow fui-target-group-arrow-right">
          ▶
        </span>
      </div>

      ${combatants.map(createTargetButton).join("")}
    </div>
  `;
}

// =====================================================
// TARGET MENU HTML
// =====================================================

function createTargetMenuHTML({
  action,
  actionType,
  targetCount,
  party,
  enemies,
}) {
  const actionLabel = getActionLabel(actionType);

  return `
    <div class="fui-command-title">
      TARGET
    </div>

    <div class="fui-target-action">
      ${actionLabel}${action ? ` / ${action.name}` : ""}
    </div>

    <div class="fui-target-list">
      ${createTargetGroup("party", "PARTY", party)}

      ${createTargetGroup("enemies", "ENEMIES", enemies)}
    </div>

    <div class="fui-target-count">
      Selected: 0/${targetCount}
    </div>

    <div class="fui-target-scrollbar">
      <div
        class="fui-target-scrollbar-arrow fui-target-scrollbar-arrow-up"
      ></div>

      <div class="fui-target-scrollbar-track">
        <div class="fui-target-scrollbar-thumb"></div>
      </div>

      <div
        class="fui-target-scrollbar-arrow fui-target-scrollbar-arrow-down"
      ></div>
    </div>
  `;
}

// =====================================================
// SCROLLBAR
// =====================================================

function updateTargetScrollbar(
  targetList,
  scrollbar,
  scrollbarTrack,
  scrollbarThumb,
) {
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

// =====================================================
// MARQUEE
// =====================================================

function applyMarqueeIfNeeded(button) {
  const nameElement = button.querySelector(".fui-target-name");

  const innerElement = button.querySelector(".fui-target-name-inner");

  if (!nameElement || !innerElement) {
    return;
  }

  const overflow = innerElement.scrollWidth - nameElement.clientWidth;

  if (overflow <= 0) {
    clearMarquee(button);
    return;
  }

  const pixelsPerSecond = 40;

  const duration = Math.max(2, overflow / pixelsPerSecond + 1.5);

  innerElement.style.setProperty(
    "--fui-target-marquee-distance",
    `-${overflow}px`,
  );

  innerElement.style.setProperty(
    "--fui-target-marquee-duration",
    `${duration}s`,
  );

  button.classList.add("fui-marquee");
}

function clearMarquee(button) {
  const innerElement = button.querySelector(".fui-target-name-inner");

  button.classList.remove("fui-marquee");

  innerElement?.style.removeProperty("--fui-target-marquee-distance");

  innerElement?.style.removeProperty("--fui-target-marquee-duration");
}

function updateTargetMarquee(targetButtons) {
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

// =====================================================
// TOKEN
// =====================================================

function getTokenForCombatantId(combatantId) {
  const combatant = game.combat?.combatants.get(combatantId);

  return combatant?.token?.object ?? null;
}

// =====================================================
// OPEN TARGET SELECT MENU
// =====================================================

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

  const { party, enemies } = getCombatantGroups();

  const targetMenu = document.createElement("div");

  targetMenu.className = "fui-target-select-menu fui-submenu";

  targetMenu.innerHTML = createTargetMenuHTML({
    action,
    actionType,
    targetCount,
    party,
    enemies,
  });

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

  // ===================================================
  // ELEMENTS
  // ===================================================

  const targetList = targetMenu.querySelector(".fui-target-list");

  const targetGroups = {
    party: targetMenu.querySelector('[data-target-group="party"]'),

    enemies: targetMenu.querySelector('[data-target-group="enemies"]'),
  };

  const targetButtons = Array.from(
    targetMenu.querySelectorAll(".fui-target-button"),
  );

  const cursor = createHudCursor(targetMenu);

  const canvasCursor = createCanvasCursor();

  setCanvasCursor(ui, canvasCursor);

  const scrollbar = targetMenu.querySelector(".fui-target-scrollbar");

  const scrollbarTrack = targetMenu.querySelector(
    ".fui-target-scrollbar-track",
  );

  const scrollbarThumb = targetMenu.querySelector(
    ".fui-target-scrollbar-thumb",
  );

  // ===================================================
  // GROUPS
  // ===================================================

  const groups = [
    {
      id: "party",
      element: targetGroups.party,
      buttons: Array.from(
        targetGroups.party?.querySelectorAll(".fui-target-button") ?? [],
      ),
    },

    {
      id: "enemies",
      element: targetGroups.enemies,
      buttons: Array.from(
        targetGroups.enemies?.querySelectorAll(".fui-target-button") ?? [],
      ),
    },
  ];

  let activeGroupIndex = groups[0].buttons.length > 0 ? 0 : 1;

  const groupSelectedIndexes = [0, 0];

  const selectedTargets = new Set();

  let isTransitioning = false;

  // ===================================================
  // GROUP HELPERS
  // ===================================================

  function getActiveGroup() {
    return groups[activeGroupIndex];
  }

  function getActiveButtons() {
    return getActiveGroup()?.buttons ?? [];
  }

  function getSelectedIndex() {
    return groupSelectedIndexes[activeGroupIndex] ?? 0;
  }

  function setSelectedIndex(index) {
    groupSelectedIndexes[activeGroupIndex] = index;
  }

  function findNextAvailableGroup(direction) {
    if (groups.length <= 1) {
      return activeGroupIndex;
    }

    let nextIndex = activeGroupIndex;

    for (let i = 0; i < groups.length; i++) {
      nextIndex = (nextIndex + direction + groups.length) % groups.length;

      if (groups[nextIndex].buttons.length > 0) {
        return nextIndex;
      }
    }

    return activeGroupIndex;
  }

  function updateGroupVisibility() {
    groups.forEach((group, index) => {
      if (!group.element) {
        return;
      }

      group.element.hidden = index !== activeGroupIndex;
    });
  }

  // ===================================================
  // FOCUSED BUTTON
  // ===================================================

  function getFocusedButton() {
    const activeButtons = getActiveButtons();

    const selectedIndex = getSelectedIndex();

    return activeButtons[selectedIndex];
  }

  // ===================================================
  // SELECTION UPDATE
  // ===================================================

  function updateSelection() {
    const activeButtons = getActiveButtons();

    const selectedIndex = getSelectedIndex();

    targetButtons.forEach((button) => {
      button.classList.remove("fui-active");
    });

    const activeButton = activeButtons[selectedIndex];

    if (activeButton) {
      activeButton.classList.add("fui-active");

      activeButton.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }

    cursor.update(activeButton);

    canvasCursor.setFocusedToken(
      activeButton
        ? getTokenForCombatantId(activeButton.dataset.combatantId)
        : null,
    );

    requestAnimationFrame(() =>
      updateTargetScrollbar(
        targetList,
        scrollbar,
        scrollbarTrack,
        scrollbarThumb,
      ),
    );

    requestAnimationFrame(() => updateTargetMarquee(targetButtons));
  }

  // ===================================================
  // SELECTED TARGETS
  // ===================================================

  function updateSelectedTargets() {
    targetButtons.forEach((button) => {
      const selected = selectedTargets.has(button.dataset.combatantId);

      button.classList.toggle("fui-selected", selected);
    });

    const counter = targetMenu.querySelector(".fui-target-count");

    if (counter) {
      counter.textContent = `Selected: ${selectedTargets.size}/${targetCount}`;
    }

    canvasCursor.setSelectedTokens(
      [...selectedTargets].map(getTokenForCombatantId).filter(Boolean),
    );
  }

  // ===================================================
  // CHANGE GROUP
  // ===================================================

  let isGroupTransitioning = false;
  function changeGroup(direction) {
    if (isGroupTransitioning) {
      return false;
    }
    const nextGroupIndex = findNextAvailableGroup(direction);
    if (nextGroupIndex === activeGroupIndex) {
      return false;
    }
    const currentGroup = groups[activeGroupIndex];
    const nextGroup = groups[nextGroupIndex];
    if (!currentGroup?.element || !nextGroup?.element) {
      return false;
    }
    isGroupTransitioning = true;
    const isForward = direction > 0;
    const exitClass = isForward
      ? "fui-target-group-exit-left"
      : "fui-target-group-exit-right";
    const enterClass = isForward
      ? "fui-target-group-enter-right"
      : "fui-target-group-enter-left";
    currentGroup.element.hidden = false;
    nextGroup.element.hidden = false;
    currentGroup.element.classList.add(exitClass);
    nextGroup.element.classList.add(enterClass);
    const finishTransition = () => {
      currentGroup.element.classList.remove(exitClass);
      nextGroup.element.classList.remove(enterClass);
      currentGroup.element.hidden = true;
      activeGroupIndex = nextGroupIndex;
      updateSelection();
      isGroupTransitioning = false;
    };
    nextGroup.element.addEventListener("animationend", finishTransition, {
      once: true,
    });
    return true;
  }

  // ===================================================
  // SELECT TARGET
  // ===================================================

  function selectTarget() {
    const activeButtons = getActiveButtons();

    const selectedIndex = getSelectedIndex();

    const button = activeButtons[selectedIndex];

    if (!button) {
      return false;
    }

    const combatantId = button.dataset.combatantId;

    if (selectedTargets.has(combatantId)) {
      selectedTargets.delete(combatantId);

      updateSelectedTargets();

      return false;
    }

    if (selectedTargets.size >= targetCount) {
      return false;
    }

    selectedTargets.add(combatantId);

    updateSelectedTargets();

    playUISound("confirm");

    return selectedTargets.size === targetCount;
  }

  // ===================================================
  // OPEN CONFIRMATION
  // ===================================================

  function openConfirmation() {
    if (isTransitioning) {
      return;
    }

    isTransitioning = true;

    if (actionType === "study") {
      destroyCanvasCursor(ui);

      executeAction({
        actor,
        action,
        actionType,
        targetIds: [...selectedTargets],
        ui,
      });

      return;
    }

    const targetSelectRect = targetMenu.getBoundingClientRect();

    targetMenu.remove();

    openConfirmMenu({
      actor,
      action,
      actionType,
      targetIds: [...selectedTargets],
      ui,
      previousMenu,
      positionRect: targetSelectRect,
      canvasCursor,
    });
  }

  // ===================================================
  // CLOSE TARGET SELECT
  // ===================================================

  function closeTargetSelectMenu() {
    destroyCanvasCursor(ui);

    hideMenu(targetMenu);

    if (isCommandMenu) {
      previousMenu.classList.add("fui-ui-focused");

      previousMenu.tabIndex = 0;
      previousMenu.focus();

      return;
    }

    showMenu(previousMenu);
  }

  // ===================================================
  // SCROLL
  // ===================================================

  targetList?.addEventListener("scroll", () => {
    cursor.update(getFocusedButton());

    updateTargetScrollbar(
      targetList,
      scrollbar,
      scrollbarTrack,
      scrollbarThumb,
    );
  });

  // ===================================================
  // MOUSE / CLICK
  // ===================================================

  targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const groupElement = button.closest(".fui-target-group");

      const groupIndex = groups.findIndex(
        (group) => group.element === groupElement,
      );

      if (groupIndex !== -1) {
        activeGroupIndex = groupIndex;

        setSelectedIndex(groups[groupIndex].buttons.indexOf(button));

        updateGroupVisibility();
      }

      const complete = selectTarget();

      if (complete) {
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

  // ===================================================
  // KEYBOARD
  // ===================================================

  targetMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      const activeButtons = getActiveButtons();

      if (activeButtons.length === 0) {
        return;
      }

      const currentIndex = getSelectedIndex();

      setSelectedIndex(
        (currentIndex - 1 + activeButtons.length) % activeButtons.length,
      );

      updateSelection();

      playUISound("navigate");

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      const activeButtons = getActiveButtons();

      if (activeButtons.length === 0) {
        return;
      }

      const currentIndex = getSelectedIndex();

      setSelectedIndex((currentIndex + 1) % activeButtons.length);

      updateSelection();

      playUISound("navigate");

      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();

      if (changeGroup(-1)) {
        playUISound("swipe");
      }

      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();

      if (changeGroup(1)) {
        playUISound("swipe");
      }

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      const complete = selectTarget();

      if (complete) {
        openConfirmation();
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      playUISound("cancel");

      closeTargetSelectMenu();

      return;
    }
  });

  // ===================================================
  // INITIAL STATE
  // ===================================================

  updateGroupVisibility();
  updateSelection();
  updateSelectedTargets();

  requestAnimationFrame(() => {
    updateTargetScrollbar(
      targetList,
      scrollbar,
      scrollbarTrack,
      scrollbarThumb,
    );

    cursor.update(getFocusedButton());

    updateTargetMarquee(targetButtons);
  });
}
