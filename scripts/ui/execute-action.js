import { hideAllSubmenus } from "./menu-utils.js";

export async function executeAction({
  actor,
  action,
  actionType,
  targetIds,
  ui,
}) {
  console.log("=== EXECUTE ACTION ===");
  console.log("Actor:", actor.name);
  console.log("Action:", action?.name);
  console.log("Action Type:", actionType);
  console.log("Target IDs:", targetIds);

  if (!actor) {
    console.error("EXECUTE: ator não encontrado.");

    return;
  }

  if (actionType !== "study" && !action) {
    console.error("EXECUTE: ação não encontrada.");

    return;
  }

  const combatants = game.combat?.combatants.contents ?? [];

  const targetTokens = targetIds
    .map((id) => combatants.find((combatant) => combatant.id === id))
    .filter((combatant) => combatant?.token?.object)
    .map((combatant) => combatant.token.object);

  console.log(
    "Targets:",
    targetTokens.map((token) => token.actor?.name),
  );

  if (targetTokens.length === 0) {
    console.error("EXECUTE: nenhum alvo encontrado.");

    return;
  }

  game.user.targets.clear();

  for (const token of targetTokens) {
    game.user.targets.add(token);
  }

  if (actionType === "study") {
    console.log("EXECUTE: iniciando Study pelo Project FU...");

    const actionHandler = new game.projectfu.ActionHandler(actor);

    await actionHandler.handleStudyAction();

    console.log("EXECUTE: Study concluído.");

    const commandMenu = ui.querySelector(".fabula-command");

    if (!commandMenu) {
      return;
    }

    hideAllSubmenus(ui);

    commandMenu.hidden = false;

    commandMenu.classList.remove(
      "attack-menu-open",
      "skill-menu-open",
      "item-menu-open",
      "submenu-open",
    );

    commandMenu.classList.add("ui-focused");

    commandMenu.tabIndex = 0;
    commandMenu.focus();

    console.log("EXECUTE: UI retornou para COMMAND.");

    return;
  }

  const modifiers = {
    shift: false,
    alt: false,
    ctrl: false,
    meta: false,
  };

  console.log("EXECUTE: disparando roll nativo do Project FU...");

  await action.roll(modifiers);

  console.log("EXECUTE: ação concluída.");

  hideAllSubmenus(ui);

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

  console.log("EXECUTE: UI retornou para COMMAND.");
}
