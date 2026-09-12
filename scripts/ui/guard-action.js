import { returnToCommand } from "./menu-utils.js";

export async function executeGuard(actor, ui) {
  if (!actor) {
    console.error("GUARD: ator não encontrado.");
    return;
  }

  if (!game.projectfu?.ActionHandler) {
    console.error("GUARD: Project FU ActionHandler não está disponível.");
    return;
  }

  console.log("GUARD: executando Guard para", actor.name);

  const actionHandler = new game.projectfu.ActionHandler(actor);

  await actionHandler.handleAction("guard", false);

  returnToCommand(ui);

  console.log("GUARD: UI retornou para COMMAND.");
}
