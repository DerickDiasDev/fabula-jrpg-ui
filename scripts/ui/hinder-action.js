import { returnToCommand } from "./menu-utils.js";

export async function executeHinder(actor, ui) {
  if (!actor) {
    console.error("HINDER: ator não encontrado.");
    return;
  }

  if (!game.projectfu?.ActionHandler) {
    console.error("HINDER: Project FU ActionHandler não está disponível.");
    return;
  }

  console.log("HINDER: executando Hinder para", actor.name);

  const actionHandler = new game.projectfu.ActionHandler(actor);

  await actionHandler.handleAction("hinder", false);

  returnToCommand(ui);

  console.log("HINDER: UI retornou para COMMAND.");
}
