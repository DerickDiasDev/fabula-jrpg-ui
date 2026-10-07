import { getPartyCards } from "./party-card.js";

// =====================================================
// TURN INDICATOR
// =====================================================
//
// Mostra em cada card da Party se o personagem ainda tem
// turno na rodada atual. Quem registra os turnos tomados é
// o Project FU (flag do Combat); aqui só é feita a leitura
// via combat.countTurnsLeft().
//
// O indicador é um elemento dentro do card
// (data-fui-party-card), então funciona em qualquer tema;
// cada tema posiciona .fui-turn-indicator no seu CSS.
// =====================================================

const INDICATOR_CLASS = "fui-turn-indicator";

function ensureIndicator(card) {
  let indicator = card.querySelector(`:scope > .${INDICATOR_CLASS}`);

  if (!indicator) {
    indicator = document.createElement("span");

    indicator.className = INDICATOR_CLASS;

    indicator.setAttribute("aria-hidden", "true");

    card.appendChild(indicator);
  }

  return indicator;
}

// `combat` null limpa os indicadores (fora de combate).
export function updateTurnIndicators(combat, ui) {
  const turnsLeft = combat?.countTurnsLeft?.() ?? null;

  for (const card of getPartyCards(ui)) {
    const indicator = ensureIndicator(card);

    const combatant = turnsLeft
      ? combat.combatants.find(
          (candidate) => candidate.actor?.id === card.dataset.actorId,
        )
      : null;

    if (!combatant) {
      indicator.hidden = true;

      continue;
    }

    const hasTurnLeft = (turnsLeft[combatant.id] ?? 0) > 0;

    indicator.hidden = false;

    indicator.classList.toggle("fui-turn-available", hasTurnLeft);

    indicator.classList.toggle("fui-turn-spent", !hasTurnLeft);

    indicator.title = hasTurnLeft ? "Turn available" : "Turn taken";
  }
}
