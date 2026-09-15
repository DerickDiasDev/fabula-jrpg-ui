// =====================================================
// MENU VISIBILITY
// =====================================================

export function showMenu(menu) {
  if (!menu) return;

  menu.hidden = false;
  menu.classList.add("fui-ui-focused");
  menu.focus();

  const ui = menu.closest("#fabula-jrpg-ui");
  if (!ui) return;

  const commandMenu = ui.querySelector(".fui-command");

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

// =====================================================
// ACTIVE SUBMENU
// =====================================================

export function getActiveSubmenu(ui) {
  if (!ui) {
    return null;
  }

  return ui.querySelector(".fui-submenu:not([hidden])");
}

// =====================================================
// DESTROY SUBMENU
// =====================================================
//
// Runs a dynamically created submenu's _fabulaCleanup (if
// any) and permanently removes it from the DOM. This is for
// submenus that are being abandoned for good, as opposed to
// hideMenu(), which only hides a menu that may still be
// shown again later via showMenu() during back-navigation.
// =====================================================

function destroySubmenu(menu) {
  if (typeof menu._fabulaCleanup === "function") {
    menu._fabulaCleanup();
    delete menu._fabulaCleanup;
  }

  menu.remove();
}

// =====================================================
// HIDE ALL SUBMENUS
// =====================================================

export function hideAllSubmenus(ui) {
  if (!ui) {
    return;
  }

  ui.querySelectorAll(".fui-submenu").forEach((menu) => {
    destroySubmenu(menu);
  });

  const commandMenu = ui.querySelector(".fui-command");

  if (commandMenu) {
    commandMenu.classList.remove("fui-submenu-open");
  }
}

// =====================================================
// RETURN TO COMMAND
// =====================================================

export function returnToCommand(ui) {
  if (!ui) {
    return;
  }

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

// =====================================================
// CLOSE ACTIVE SUBMENU
// =====================================================

export function closeActiveSubmenu(ui) {
  if (!ui) {
    return false;
  }

  const activeSubmenu = getActiveSubmenu(ui);

  if (!activeSubmenu) {
    destroyCanvasCursor(ui);
    return false;
  }

  destroySubmenu(activeSubmenu);

  destroyCanvasCursor(ui);

  const commandMenu = ui.querySelector(".fui-command");

  if (commandMenu) {
    commandMenu.classList.add("fui-ui-focused");
    commandMenu.focus();
  }

  return true;
}

// =====================================================
// CANVAS CURSOR
// =====================================================

export function setCanvasCursor(ui, canvasCursor) {
  if (!ui) {
    return;
  }

  ui._fabulaCanvasCursor = canvasCursor;
}

export function destroyCanvasCursor(ui) {
  if (!ui) {
    return;
  }

  ui._fabulaCanvasCursor?.destroy();
  ui._fabulaCanvasCursor = null;
}
