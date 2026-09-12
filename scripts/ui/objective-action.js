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

  const commandMenu = ui.querySelector(".fabula-command");

  if (!commandMenu) {
    return;
  }

  commandMenu.classList.remove(
    "attack-menu-open",
    "skill-menu-open",
    "item-menu-open",
  );

  commandMenu.classList.add("ui-focused");

  commandMenu.tabIndex = 0;

  commandMenu.focus();

  console.log("OBJECTIVE: UI retornou para COMMAND.");
}
