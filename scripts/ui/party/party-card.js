// =====================================================
// PARTY CARD LOOKUP
// =====================================================
//
// Contrato entre temas: cada renderer da Party marca o
// elemento que representa o card de um Actor com
// data-fui-party-card e data-actor-id. Estados comuns
// (turno ativo, alvo) são aplicados nesse elemento, e cada
// tema estiliza as classes no seu próprio CSS.
// =====================================================

const PARTY_CARD_SELECTOR = "[data-fui-party-card]";

export function getPartyCards(root = document) {
  if (!root) {
    return [];
  }

  return Array.from(root.querySelectorAll(PARTY_CARD_SELECTOR));
}

export function getPartyCard(actorId, root = document) {
  if (!actorId || !root) {
    return null;
  }

  return root.querySelector(
    `${PARTY_CARD_SELECTOR}[data-actor-id="${CSS.escape(actorId)}"]`,
  );
}
