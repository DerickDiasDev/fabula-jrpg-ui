// Combatants em KO não podem ser alvo, em nenhum grupo.
function isTargetable(combatant) {
  return !combatant.actor?.statuses?.has("ko");
}

// Ordem natural pelo nome exibido: "Skeleton 2" vem antes
// de "Skeleton 10", independente da ordem em que os
// combatants foram adicionados ao combate.
function sortByName(combatants) {
  const collator = new Intl.Collator(game.i18n?.lang, {
    numeric: true,
    sensitivity: "base",
  });

  return combatants.sort((a, b) =>
    collator.compare(a.actor?.name ?? "", b.actor?.name ?? ""),
  );
}

export function getCombatantGroups() {
  const combatants = sortByName(
    (game.combat?.combatants.contents ?? []).filter(isTargetable),
  );

  const party = combatants.filter(
    (combatant) => combatant.actor?.type === "character",
  );

  const enemies = combatants.filter(
    (combatant) => combatant.actor?.type !== "character",
  );

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
