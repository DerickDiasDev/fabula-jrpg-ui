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

  // =====================================================
  // TARGET DATA
  // =====================================================

  const combatants = game.combat?.combatants.contents ?? [];

  const party = combatants.filter(
    (combatant) => combatant.actor?.type === "character",
  );

  const enemies = combatants.filter((combatant) => {
    const actor = combatant.actor;

    if (actor?.type === "character") {
      return false;
    }

    // KO/Death não pode ser alvo.
    return !actor?.statuses?.has("ko");
  });

  // =====================================================
  // ACTION LABEL
  // =====================================================

  const actionLabel =
    actionType === "skill"
      ? "Skill"
      : actionType === "item"
        ? "Item"
        : actionType === "study"
          ? "Study"
          : "Attack";

  // =====================================================
  // CREATE MENU
  // =====================================================

  const targetMenu = document.createElement("div");

  targetMenu.className = "fui-target-select-menu fui-submenu";

  targetMenu.innerHTML = `
    <div class="fui-command-title">
      TARGET
    </div>

    <div class="fui-target-action">
      ${actionLabel}${action ? ` / ${action.name}` : ""}
    </div>

    <div class="fui-target-list">

      <div class="fui-target-group" data-target-group="party">
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

      <div class="fui-target-group" data-target-group="enemies">
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

  // =====================================================
  // DOM REFERENCES
  // =====================================================

  const targetList = targetMenu.querySelector(".fui-target-list");

  const targetGroups = {
    party: targetMenu.querySelector('[data-target-group="party"]'),

    enemies: targetMenu.querySelector('[data-target-group="enemies"]'),
  };

  const targetButtons = targetMenu.querySelectorAll(".fui-target-button");

  const targetCursor = targetMenu.querySelector(".fui-target-cursor");

  const scrollbar = targetMenu.querySelector(".fui-target-scrollbar");

  const scrollbarTrack = targetMenu.querySelector(
    ".fui-target-scrollbar-track",
  );

  const scrollbarThumb = targetMenu.querySelector(
    ".fui-target-scrollbar-thumb",
  );

  // =====================================================
  // GROUP STATE
  // =====================================================

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

  // PARTY começa selecionado quando existir.
  // Caso esteja vazio, começa em ENEMIES.
  let activeGroupIndex = groups[0].buttons.length > 0 ? 0 : 1;

  // Cada grupo mantém sua própria posição.
  const groupSelectedIndexes = [0, 0];

  const selectedTargets = new Set();

  // =====================================================
  // GROUP HELPERS
  // =====================================================

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

  // =====================================================
  // GROUP VISUAL STATE
  // =====================================================

  function updateGroupVisibility() {
    groups.forEach((group, index) => {
      if (!group.element) {
        return;
      }

      group.element.hidden = index !== activeGroupIndex;
    });
  }

  // =====================================================
  // TARGET CURSOR
  // =====================================================

  function updateTargetCursor() {
    const activeButtons = getActiveButtons();
    const selectedIndex = getSelectedIndex();
    const button = activeButtons[selectedIndex];

    if (!button || !targetCursor || !targetList) {
      return;
    }

    const top = targetList.offsetTop + button.offsetTop - targetList.scrollTop;

    targetCursor.style.top = `${top}px`;
    targetCursor.style.height = `${button.offsetHeight}px`;
  }

  // =====================================================
  // SCROLLBAR
  // =====================================================

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

  // =====================================================
  // MARQUEE
  // =====================================================

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

  // =====================================================
  // SELECTION / FOCUS
  // =====================================================

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

    updateTargetCursor();

    requestAnimationFrame(updateTargetScrollbar);
    requestAnimationFrame(updateTargetMarquee);
  }

  // =====================================================
  // SELECTED TARGETS
  // =====================================================

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

  // =====================================================
  // CHANGE GROUP
  // =====================================================

  function changeGroup(direction) {
    const nextGroupIndex = findNextAvailableGroup(direction);

    if (nextGroupIndex === activeGroupIndex) {
      return;
    }

    activeGroupIndex = nextGroupIndex;

    updateGroupVisibility();
    updateSelection();
  }

  // =====================================================
  // SELECT TARGET
  // =====================================================

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

    return selectedTargets.size === targetCount;
  }

  // =====================================================
  // CONFIRMATION
  // =====================================================

  let isTransitioning = false;

  function openConfirmation() {
    if (isTransitioning) return;

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

    // Guarda a posição ANTES de remover o Target Select
    const targetSelectRect = targetMenu.getBoundingClientRect();

    // Remove o Target Select do DOM
    targetMenu.remove();

    openConfirmMenu({
      actor,
      action,
      actionType,
      targetIds: [...selectedTargets],
      ui,
      previousMenu,
      positionRect: targetSelectRect,
    });
  }

  // =====================================================
  // CLOSE MENU
  // =====================================================

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

  // =====================================================
  // SCROLL
  // =====================================================

  targetList?.addEventListener("scroll", () => {
    updateTargetCursor();
    updateTargetScrollbar();
  });

  // =====================================================
  // BUTTON EVENTS
  // =====================================================

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

  // =====================================================
  // KEYBOARD NAVIGATION
  // =====================================================

  targetMenu.addEventListener("keydown", (event) => {
    // ---------------------------------------------------
    // UP
    // ---------------------------------------------------

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

      return;
    }

    // ---------------------------------------------------
    // DOWN
    // ---------------------------------------------------

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

      return;
    }

    // ---------------------------------------------------
    // LEFT
    // ---------------------------------------------------

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();

      changeGroup(-1);

      return;
    }

    // ---------------------------------------------------
    // RIGHT
    // ---------------------------------------------------

    if (event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();

      changeGroup(1);

      return;
    }

    // ---------------------------------------------------
    // ENTER
    // ---------------------------------------------------

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();

      const complete = selectTarget();

      if (complete) {
        openConfirmation();
      }

      return;
    }

    // ---------------------------------------------------
    // ESCAPE
    // ---------------------------------------------------

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closeTargetSelectMenu();

      return;
    }
  });

  // =====================================================
  // INITIAL STATE
  // =====================================================

  updateGroupVisibility();
  updateSelection();
  updateSelectedTargets();

  requestAnimationFrame(() => {
    updateTargetScrollbar();
    updateTargetCursor();
    updateTargetMarquee();
  });
}
