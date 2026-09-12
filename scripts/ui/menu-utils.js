export function showMenu(menu) {
  if (!menu) return;

  menu.hidden = false;

  menu.classList.add("ui-focused");

  menu.focus();

  const commandMenu = menu
    .closest("#fabula-jrpg-ui")
    ?.querySelector(".fabula-command");

  if (commandMenu && menu.classList.contains("fabula-submenu")) {
    commandMenu.classList.add("submenu-open");
  }
}

export function hideMenu(menu) {
  if (!menu) return;

  menu.classList.remove("ui-focused");

  menu.hidden = true;

  const ui = menu.closest("#fabula-jrpg-ui");

  if (!ui) return;

  const commandMenu = ui.querySelector(".fabula-command");

  const activeSubmenu = getActiveSubmenu(ui);

  if (commandMenu && !activeSubmenu) {
    commandMenu.classList.remove("submenu-open");
  }
}

export function getActiveSubmenu(ui) {
  return ui.querySelector(".fabula-submenu:not([hidden])");
}

export function hideAllSubmenus(ui) {
  ui.querySelectorAll(".fabula-submenu").forEach((menu) => {
    menu.classList.remove("ui-focused");

    menu.hidden = true;
  });

  const commandMenu = ui.querySelector(".fabula-command");

  if (commandMenu) {
    commandMenu.classList.remove("submenu-open");
  }
}

export function returnToCommand(ui) {
  hideAllSubmenus(ui);

  const commandMenu = ui.querySelector(".fabula-command");

  if (!commandMenu) {
    return;
  }

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
}
