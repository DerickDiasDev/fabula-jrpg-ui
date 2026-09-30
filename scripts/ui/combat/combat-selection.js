import { getTokenForActor } from "./token-selection.js";

const MODULE_ID = "fabula-jrpg-ui";

export async function addActorsToCombat(actors) {
  console.log("ADD TO COMBAT", actors);

  if (!actors?.length) return;

  let combat = game.combat;

  if (!combat) {
    combat = await Combat.create({
      scene: canvas?.scene?.id ?? null,
      active: true,
    });
  }

  for (const actor of actors) {
    if (!actor) continue;

    console.log("Processando actor:", actor.name, actor.id);

    const existingCombatant = combat.combatants.find(
      (combatant) => combatant.actorId === actor.id,
    );

    if (existingCombatant) {
      console.log("Já está em combate:", actor.name);
      continue;
    }

    let token = getTokenForActor(actor);

    if (token) {
      console.log("Usando token existente:", token);

      if (!token.combatant) {
        await token.document.toggleCombatant();
      }

      continue;
    }

    console.log("Criando token temporário:", actor.name);

    const tokenData = actor.prototypeToken.toObject();

    tokenData.actorId = actor.id;
    tokenData.x = 0;
    tokenData.y = 0;

    tokenData.flags ??= {};
    tokenData.flags[MODULE_ID] ??= {};
    tokenData.flags[MODULE_ID].temporaryCombatToken = true;

    const createdTokens = await canvas.scene.createEmbeddedDocuments("Token", [
      tokenData,
    ]);

    token = createdTokens[0];

    if (!token) {
      console.warn("Não foi possível criar Token para:", actor.name);
      continue;
    }

    console.log("Token temporário criado:", token);

    await token.toggleCombatant();
  }
}
