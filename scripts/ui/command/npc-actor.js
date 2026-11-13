// =====================================================
// NPC ACTOR
// =====================================================
//
// Define quais Actors usam o Command de NPC (GM).
//
// Companions (rank "companion") são NPCs no Project FU, mas
// pelas regras não têm turno próprio e agem pela ação do PJ;
// por isso não usam o Command de NPC. Suporte a companions
// é uma feature futura.
// =====================================================

export function isNpcCommandActor(actor) {
  return actor?.type === "npc" && actor.system?.rank?.value !== "companion";
}
