export function createTargetSelection(groups) {
  const groupSelectedIndexes = groups.map(() => 0);
  const selectedTargets = new Set();

  let activeGroupIndex = groups[0]?.buttons.length > 0 ? 0 : 1;

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

  function getActiveGroupIndex() {
    return activeGroupIndex;
  }

  function setActiveGroupIndex(index) {
    activeGroupIndex = index;
  }

  function getFocusedButton() {
    const buttons = getActiveButtons();
    const index = getSelectedIndex();

    return buttons[index] ?? null;
  }

  function moveSelection(direction) {
    const buttons = getActiveButtons();

    if (buttons.length === 0) {
      return false;
    }

    const currentIndex = getSelectedIndex();

    const nextIndex =
      (currentIndex + direction + buttons.length) % buttons.length;

    setSelectedIndex(nextIndex);

    return true;
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

  function changeGroup(direction) {
    const nextGroupIndex = findNextAvailableGroup(direction);

    if (nextGroupIndex === activeGroupIndex) {
      return false;
    }

    activeGroupIndex = nextGroupIndex;

    return true;
  }

  function getSelectedTargets() {
    return selectedTargets;
  }

  function isSelected(combatantId) {
    return selectedTargets.has(combatantId);
  }

  function select(combatantId) {
    selectedTargets.add(combatantId);
  }

  function deselect(combatantId) {
    selectedTargets.delete(combatantId);
  }

  function toggle(combatantId) {
    if (selectedTargets.has(combatantId)) {
      selectedTargets.delete(combatantId);
      return false;
    }

    selectedTargets.add(combatantId);
    return true;
  }

  function clear() {
    selectedTargets.clear();
  }

  function getSelectedTargetIds() {
    return [...selectedTargets];
  }

  return {
    getActiveGroup,
    getActiveButtons,

    getSelectedIndex,
    setSelectedIndex,

    getActiveGroupIndex,
    setActiveGroupIndex,

    getFocusedButton,
    moveSelection,

    findNextAvailableGroup,
    changeGroup,

    getSelectedTargets,
    getSelectedTargetIds,

    isSelected,
    select,
    deselect,
    toggle,
    clear,
  };
}
