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

  const commandMenu = ui.querySelector(".fabula-command");

  if (!commandMenu) {
    return;
  }

  commandMenu.classList.remove("attack-menu-open", "skill-menu-open");

  commandMenu.classList.add("ui-focused");

  commandMenu.tabIndex = 0;

  commandMenu.focus();

  console.log("GUARD: UI retornou para COMMAND.");
}
