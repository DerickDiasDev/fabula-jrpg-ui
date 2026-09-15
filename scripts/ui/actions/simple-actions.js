import { returnToCommand } from "../menus/menu-utils.js";

async function executeSimpleAction(actor, ui, action, label) {
  if (!actor) {
    console.error(`${label}: ator não encontrado.`);
    return;
  }

  if (!game.projectfu?.ActionHandler) {
    console.error(`${label}: Project FU ActionHandler não está disponível.`);
    return;
  }

  const actionHandler = new game.projectfu.ActionHandler(actor);

  if (action === "equipment") {
    await actionHandler.equipment();
  } else {
    await actionHandler.handleAction(action, false);
  }

  returnToCommand(ui);
}

export async function executeGuard(actor, ui) {
  return executeSimpleAction(actor, ui, "guard", "GUARD");
}

export async function executeHinder(actor, ui) {
  return executeSimpleAction(actor, ui, "hinder", "HINDER");
}

export async function executeObjective(actor, ui) {
  return executeSimpleAction(actor, ui, "objective", "OBJECTIVE");
}

export async function executeEquipment(actor, ui) {
  return executeSimpleAction(actor, ui, "equipment", "EQUIPMENT");
}
