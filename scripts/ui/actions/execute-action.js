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
  const actionHandler = new game.projectfu.ActionHandler(actor);

  await actionHandler.handleStudyAction();
}

async function executeRoll(action) {
  const modifiers = createRollModifiers();

  await action.roll(modifiers);
}

export async function executeAction({
  actor,
  action,
  actionType,
  targetIds,
  ui,
}) {
  if (!actor) {
    console.error("EXECUTE: ator não encontrado.");
    return;
  }

  if (actionType !== "study" && !action) {
    console.error("EXECUTE: ação não encontrada.");
    return;
  }

  const targetTokens = getTargetTokens(targetIds);

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
