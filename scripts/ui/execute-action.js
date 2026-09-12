import { returnToCommand } from "./menu-utils.js";

export async function executeAction({
  actor,
  action,
  actionType,
  targetIds,
  ui,
}) {
  console.log("=== EXECUTE ACTION ===");
  console.log("Actor:", actor?.name);
  console.log("Action:", action?.name);
  console.log("Action Type:", actionType);
  console.log("Target IDs:", targetIds);

  if (!actor) {
    console.error("EXECUTE: ator não encontrado.");
    return;
  }

  if (actionType !== "study" && !action) {
    console.error("EXECUTE: ação não encontrada.");
    return;
  }

  const combatants = game.combat?.combatants.contents ?? [];

  const targetTokens = targetIds
    .map((id) => combatants.find((combatant) => combatant.id === id))
    .filter((combatant) => combatant?.token?.object)
    .map((combatant) => combatant.token.object);

  console.log(
    "Targets:",
    targetTokens.map((token) => token.actor?.name),
  );

  if (targetTokens.length === 0) {
    console.error("EXECUTE: nenhum alvo encontrado.");
    return;
  }

  /*
   * Project FU uses Foundry's native target system
   * during action execution.
   *
   * The UI selection is therefore synchronized with
   * game.user.targets only at execution time.
   */
  game.user.targets.clear();

  for (const token of targetTokens) {
    game.user.targets.add(token);
  }

  try {
    if (actionType === "study") {
      console.log("EXECUTE: iniciando Study pelo Project FU...");

      const actionHandler = new game.projectfu.ActionHandler(actor);

      await actionHandler.handleStudyAction();

      console.log("EXECUTE: Study concluído.");

      returnToCommand(ui);

      return;
    }

    const modifiers = {
      shift: false,
      alt: false,
      ctrl: false,
      meta: false,
    };

    console.log("EXECUTE: disparando roll nativo do Project FU...");

    await action.roll(modifiers);

    console.log("EXECUTE: ação concluída.");

    returnToCommand(ui);
  } finally {
    /*
     * Native Foundry targets are only temporary
     * synchronization state for the action.
     */
    game.user.targets.clear();
  }
}
