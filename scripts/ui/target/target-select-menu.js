import { openConfirmMenu } from "../menus/confirm-menu.js";

import { showMenu, hideMenu } from "../menus/menu-utils.js";

import { executeAction } from "../actions/execute-action.js";

import { createHudCursor } from "../shared/hud-cursor.js";

import { playUISound } from "../shared/audio.js";

import { createTargetMenuHTML } from "./target-menu-view.js";

import { getCurrentTheme } from "../theme/theme-manager.js";

import { createThemeTargetVisuals } from "./target-visual.js";

import { getCombatantGroups, createTargetGroups } from "./target-groups.js";

import { createTargetSelection } from "./target-selection.js";

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

  const backButton = targetMenu.querySelector(".fui-menu-back");

  const targetList = targetMenu.querySelector(".fui-target-list");

  const targetButtons = Array.from(
    targetMenu.querySelectorAll(".fui-target-button"),
  );

  const cursor = createHudCursor(targetMenu);

  const theme = getCurrentTheme();

  const targetVisuals = createThemeTargetVisuals(theme);

  targetMenu._fabulaCleanup = () => {
    targetVisuals.party.destroy();
    targetVisuals.enemies.destroy();
  };

  const scrollbar = targetMenu.querySelector(".fui-target-scrollbar");

  const scrollbarTrack = targetMenu.querySelector(
    ".fui-target-scrollbar-track",
  );

  const scrollbarThumb = targetMenu.querySelector(
    ".fui-target-scrollbar-thumb",
  );

  const combatantGroups = createTargetGroups({
    party,
    enemies,
  });

  const groups = combatantGroups.map((group) => {
    const element = targetMenu.querySelector(
      `[data-target-group="${group.id}"]`,
    );

    return {
      id: group.id,
      element,
      buttons: Array.from(
        element?.querySelectorAll(".fui-target-button") ?? [],
      ),
    };
  });

  const selection = createTargetSelection(groups);

  let isTransitioning = false;
  let isGroupTransitioning = false;

  function updateGroupVisibility() {
    const activeGroupIndex = selection.getActiveGroupIndex();

    groups.forEach((group, index) => {
      if (!group.element) {
        return;
      }

      group.element.hidden = index !== activeGroupIndex;
    });
  }

  function updateSelection() {
    const activeButtons = selection.getActiveButtons();

    const selectedIndex = selection.getSelectedIndex();

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

    cursor.update(selection.getFocusedButton());

    const activeGroup = selection.getActiveGroup();

    targetVisuals[activeGroup?.id]?.setFocusedTarget(
      activeButton?.dataset.combatantId ?? null,
    );

    requestAnimationFrame(() => {
      updateTargetScrollbar(
        targetList,
        scrollbar,
        scrollbarTrack,
        scrollbarThumb,
      );
    });

    requestAnimationFrame(() => {
      updateTargetMarquee(targetButtons);
    });
  }

  function updateSelectedTargets() {
    targetButtons.forEach((button) => {
      const selected = selection.isSelected(button.dataset.combatantId);

      button.classList.toggle("fui-selected", selected);
    });

    const counter = targetMenu.querySelector(".fui-target-count");

    if (counter) {
      counter.textContent = `Selected: ${
        selection.getSelectedTargets().size
      }/${targetCount}`;
    }

    const selectedByGroup = {
      party: [],
      enemies: [],
    };

    for (const combatantId of selection.getSelectedTargetIds()) {
      const button = targetButtons.find(
        (button) => button.dataset.combatantId === combatantId,
      );

      const group = button?.closest(".fui-target-group")?.dataset.targetGroup;

      if (group && selectedByGroup[group]) {
        selectedByGroup[group].push(combatantId);
      }
    }

    targetVisuals.party.setSelectedTargets(selectedByGroup.party);

    targetVisuals.enemies.setSelectedTargets(selectedByGroup.enemies);
  }

  function resetTargetSelection() {
    selection.clear();

    updateSelectedTargets();
  }

  function changeGroup(direction) {
    if (isGroupTransitioning) {
      return false;
    }

    const activeGroupIndex = selection.getActiveGroupIndex();

    const nextGroupIndex = selection.findNextAvailableGroup(direction);

    if (nextGroupIndex === activeGroupIndex) {
      return false;
    }

    const currentGroup = groups[activeGroupIndex];

    const nextGroup = groups[nextGroupIndex];

    if (!currentGroup?.element || !nextGroup?.element) {
      return false;
    }

    isGroupTransitioning = true;

    targetVisuals[currentGroup.id]?.setFocusedTarget(null);

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

      selection.changeGroup(direction);

      updateSelection();

      isGroupTransitioning = false;
    };

    nextGroup.element.addEventListener("animationend", finishTransition, {
      once: true,
    });

    return true;
  }

  const groupArrows = targetMenu.querySelectorAll(".fui-target-group-arrow");

  groupArrows.forEach((arrow) => {
    arrow.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const direction = arrow.classList.contains("fui-target-group-arrow-left")
        ? -1
        : 1;

      if (changeGroup(direction)) {
        playUISound("swipe");
      }
    });
  });

  function selectTarget() {
    const button = selection.getFocusedButton();

    if (!button) {
      return false;
    }

    const combatantId = button.dataset.combatantId;

    if (selection.isSelected(combatantId)) {
      selection.deselect(combatantId);

      updateSelectedTargets();

      return false;
    }

    if (selection.getSelectedTargets().size >= targetCount) {
      return false;
    }

    selection.select(combatantId);

    updateSelectedTargets();

    playUISound("confirm");

    return selection.getSelectedTargets().size === targetCount;
  }

  function openConfirmation() {
    if (isTransitioning) {
      return;
    }

    isTransitioning = true;

    if (actionType === "study") {
      delete targetMenu._fabulaCleanup;

      executeAction({
        actor,
        action,
        actionType,
        targetIds: selection.getSelectedTargetIds(),
        ui,
      }).finally(() => {
        targetVisuals.party.destroy();
        targetVisuals.enemies.destroy();
      });

      return;
    }

    const targetSelectRect = targetMenu.getBoundingClientRect();

    delete targetMenu._fabulaCleanup;

    hideMenu(targetMenu);

    openConfirmMenu({
      actor,
      action,
      actionType,
      targetIds: selection.getSelectedTargetIds(),
      ui,
      previousMenu,
      positionRect: targetSelectRect,
      targetVisuals,
      onClose: resetTargetSelection,
    });
  }

  function closeTargetSelectMenu() {
    resetTargetSelection();

    if (typeof targetMenu._fabulaCleanup === "function") {
      targetMenu._fabulaCleanup();

      delete targetMenu._fabulaCleanup;
    }

    hideMenu(targetMenu);

    if (isCommandMenu) {
      previousMenu.classList.add("fui-ui-focused");

      previousMenu.tabIndex = 0;
      previousMenu.focus();

      return;
    }

    showMenu(previousMenu);
  }

  backButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    playUISound("cancel");

    closeTargetSelectMenu();
  });

  targetList?.addEventListener("scroll", () => {
    cursor.update(selection.getFocusedButton());

    updateTargetScrollbar(
      targetList,
      scrollbar,
      scrollbarTrack,
      scrollbarThumb,
    );
  });
  targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const groupElement = button.closest(".fui-target-group");

      const groupIndex = groups.findIndex(
        (group) => group.element === groupElement,
      );

      if (groupIndex !== -1) {
        selection.setActiveGroupIndex(groupIndex);

        selection.setSelectedIndex(groups[groupIndex].buttons.indexOf(button));

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

  targetMenu.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();

      if (selection.moveSelection(-1)) {
        updateSelection();
        playUISound("navigate");
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();

      if (selection.moveSelection(1)) {
        updateSelection();
        playUISound("navigate");
      }

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

    cursor.update(selection.getFocusedButton());

    updateTargetMarquee(targetButtons);
  });
}
