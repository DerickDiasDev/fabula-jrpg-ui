import { returnToCommand } from "../menus/menu-utils.js";

function getTargetTokens(targetIds) {
  const combatants = game.combat?.combatants.contents ?? [];

  return targetIds
    .map((id) => combatants.find((combatant) => combatant.id === id))
    .filter((combatant) => combatant?.token?.object)
    .map((combatant) => combatant.token.object);
}

function syncFoundryTargets(targetTokens) {
  game.user.targets.clear();

  targetTokens.forEach((token) => {
    game.user.targets.add(token);
  });
}

function clearFoundryTargets() {
  game.user.targets.clear();
}

function createRollModifiers() {
  return {
    shift: false,
    alt: false,
    ctrl: false,
    meta: false,
  };
}

async function executeStudy(actor) {
  console.log("EXECUTE: iniciando Study pelo Project FU...");

  const actionHandler = new game.projectfu.ActionHandler(actor);

  await actionHandler.handleStudyAction();

  console.log("EXECUTE: Study concluído.");
}

async function executeRoll(action) {
  const modifiers = createRollModifiers();

  console.log("EXECUTE: disparando roll nativo do Project FU...");

  await action.roll(modifiers);

  console.log("EXECUTE: ação concluída.");
}

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

  const targetTokens = getTargetTokens(targetIds);

  console.log(
    "Targets:",
    targetTokens.map((token) => token.actor?.name),
  );

  if (targetTokens.length === 0) {
    console.error("EXECUTE: nenhum alvo encontrado.");
    return;
  }

  syncFoundryTargets(targetTokens);

  try {
    if (actionType === "study") {
      await executeStudy(actor);
    } else {
      await executeRoll(action);
    }

    returnToCommand(ui);
  } finally {
    clearFoundryTargets();
  }
}
