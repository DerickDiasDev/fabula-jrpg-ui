import { returnToCommand } from "./menu-utils.js";

export async function executeEquipment(actor, ui) {
  if (!actor) {
    console.error("EQUIPMENT: ator não encontrado.");
    return;
  }

  if (!game.projectfu?.ActionHandler) {
    console.error("EQUIPMENT: Project FU ActionHandler não está disponível.");
    return;
  }

  console.log("EQUIPMENT: abrindo Equipment para", actor.name);

  const actionHandler = new game.projectfu.ActionHandler(actor);

  await actionHandler.equipment();

  returnToCommand(ui);

  console.log("EQUIPMENT: UI retornou para COMMAND.");
}
