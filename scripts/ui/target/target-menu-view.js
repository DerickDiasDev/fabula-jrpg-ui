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

export function createTargetMenuHTML({
  action,
  actionType,
  targetCount,
  party,
  enemies,
}) {
  const actionLabel = getActionLabel(actionType);

  return `
    <div class="fui-command-title">
      <button
        class="fui-menu-back"
        type="button"
        aria-label="Back"
      >
        ←
      </button>
      <span>Target</span>
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
