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

  const commandMenu = ui.querySelector(".fabula-command");

  if (!commandMenu) {
    return;
  }

  commandMenu.classList.add("ui-focused");

  commandMenu.tabIndex = 0;
  commandMenu.focus();

  console.log("EQUIPMENT: UI retornou para COMMAND.");
}
