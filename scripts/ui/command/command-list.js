// =====================================================
// COMMAND LISTS
// =====================================================
//
// Cada comando é identificado pelo `id` (renderizado como
// data-command); o `label` é apenas o texto exibido. O
// Command Menu despacha pelo id, nunca pelo texto.
// =====================================================

export const PLAYER_COMMANDS = Object.freeze([
  { id: "attack", label: "Attack" },
  { id: "skill", label: "Skill" },
  { id: "study", label: "Study" },
  { id: "guard", label: "Guard" },
  { id: "item", label: "Item" },
  { id: "equipment", label: "Equipment" },
  { id: "hinder", label: "Hinder" },
  { id: "objective", label: "Objective" },
]);

// Command de NPC (GM). Segue a aba Combat da ficha de NPC
// do Project FU: ataques básicos, feitiços e poderes.
export const NPC_COMMANDS = Object.freeze([
  { id: "attack", label: "Attack" },
  { id: "spell", label: "Spell" },
  { id: "skill", label: "Skill" },
  { id: "guard", label: "Guard" },
  { id: "hinder", label: "Hinder" },
]);
