import { openTargetSelectMenu } from "../menus/target-select-menu.js";

export function executeStudy(actor, ui) {
  if (!actor) {
    console.error("STUDY: ator não encontrado.");
    return;
  }

  const commandMenu = ui?.querySelector(".fui-command");

  if (!commandMenu) {
    console.error("STUDY: Command Menu não encontrado.");
    return;
  }

  openTargetSelectMenu({
    actor,
    action: null,
    actionType: "study",
    targetCount: 1,
    ui,
    previousMenu: commandMenu,
  });
}
