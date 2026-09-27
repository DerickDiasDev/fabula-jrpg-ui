export function getCombatantGroups() {
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

export function createTargetGroups({ party, enemies }) {
  return [
    {
      id: "party",
      combatants: party,
    },
    {
      id: "enemies",
      combatants: enemies,
    },
  ];
}
