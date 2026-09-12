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

  console.log("HINDER: UI retornou para COMMAND.");
}
