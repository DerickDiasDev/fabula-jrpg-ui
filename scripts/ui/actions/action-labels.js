// =====================================================
// ACTION LABELS
// =====================================================
//
// Texto exibido para cada actionType nos menus do fluxo
// (Target Count, Target Select, Confirm).
// =====================================================

const ACTION_LABELS = {
  attack: "Attack",
  skill: "Skill",
  spell: "Spell",
  item: "Item",
  study: "Study",
};

export function getActionLabel(actionType) {
  return ACTION_LABELS[actionType] ?? "Attack";
}
