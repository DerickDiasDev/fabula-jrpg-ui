export function showMenu(menu) {
  if (!menu) return;

  menu.hidden = false;

  menu.classList.add("fui-ui-focused");

  menu.focus();

  const commandMenu = menu
    .closest("#fabula-jrpg-ui")
    ?.querySelector(".fui-command");

  if (commandMenu && menu.classList.contains("fui-submenu")) {
    commandMenu.classList.add("fui-submenu-open");
  }
}

export function hideMenu(menu) {
  if (!menu) return;

  menu.classList.remove("fui-ui-focused");

  menu.hidden = true;

  const ui = menu.closest("#fabula-jrpg-ui");

  if (!ui) return;

  const commandMenu = ui.querySelector(".fui-command");

  const activeSubmenu = getActiveSubmenu(ui);

  if (commandMenu && !activeSubmenu) {
    commandMenu.classList.remove("fui-submenu-open");
  }
}

export function getActiveSubmenu(ui) {
  return ui.querySelector(".fui-submenu:not([hidden])");
}

export function hideAllSubmenus(ui) {
  ui.querySelectorAll(".fui-submenu").forEach((menu) => {
    menu.classList.remove("fui-ui-focused");

    menu.hidden = true;
  });

  const commandMenu = ui.querySelector(".fui-command");

  if (commandMenu) {
    commandMenu.classList.remove("fui-submenu-open");
  }
}

export function returnToCommand(ui) {
  hideAllSubmenus(ui);

  const commandMenu = ui.querySelector(".fui-command");

  if (!commandMenu) {
    return;
  }

  commandMenu.hidden = false;

  commandMenu.classList.remove(
    "fui-attack-menu-open",
    "fui-skill-menu-open",
    "fui-item-menu-open",
    "fui-submenu-open",
  );

  commandMenu.classList.add("fui-ui-focused");

  commandMenu.tabIndex = 0;
  commandMenu.focus();
}

export function closeActiveSubmenu(ui) {
  const activeSubmenu = getActiveSubmenu(ui);

  if (!activeSubmenu) {
    return false;
  }

  activeSubmenu.hidden = true;

  activeSubmenu.classList.remove("ui-focused", "fui-ui-focused");

  ui.querySelector(".fui-command")?.classList.add("fui-ui-focused");

  ui.querySelector(".fui-command")?.focus();

  return true;
}
