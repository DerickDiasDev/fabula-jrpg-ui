import { returnToCommand } from "./menu-utils.js";

export async function executeObjective(actor, ui) {
  if (!actor) {
    console.error("OBJECTIVE: ator não encontrado.");
    return;
  }

  if (!game.projectfu?.ActionHandler) {
    console.error("OBJECTIVE: Project FU ActionHandler não está disponível.");
    return;
  }

  console.log("OBJECTIVE: executando Objective para", actor.name);

  const actionHandler = new game.projectfu.ActionHandler(actor);

  await actionHandler.handleAction("objective", false);

  returnToCommand(ui);

  console.log("OBJECTIVE: UI retornou para COMMAND.");
}
