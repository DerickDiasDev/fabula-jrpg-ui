const THEME_STYLES = {
  octopath: [
    "party.css",
    "command.css",
    "action.css",
    "target.css",
    "target-select.css",
    "confirm.css",
  ],

  wizardry: [
    "party.css",
    "command.css",
    "action.css",
    "target.css",
    "target-select.css",
    "confirm.css",
  ],
};

const THEMES = {
  octopath: {
    id: "octopath",
    name: "Octopath",

    targetVisuals: {
      party: "canvas",
      enemies: "canvas",
    },
  },

  wizardry: {
    id: "wizardry",
    name: "Wizardry",

    targetVisuals: {
      party: "card",
      enemies: "canvas",
    },
  },
};

function getConfiguredThemeId() {
  return game.settings.get("fabula-jrpg-ui", "theme");
}

export function getCurrentTheme() {
  const themeId = getConfiguredThemeId();

  return THEMES[themeId] ?? THEMES.octopath;
}

function loadThemeStyles(themeId) {
  const styles = THEME_STYLES[themeId] ?? [];

  for (const file of styles) {
    const styleId = `fabula-theme-style-${themeId}-${file.replace(".css", "")}`;

    if (document.querySelector(`#${styleId}`)) {
      continue;
    }

    const link = document.createElement("link");

    link.id = styleId;
    link.rel = "stylesheet";
    link.href = `modules/fabula-jrpg-ui/styles/themes/${themeId}/${file}`;

    document.head.appendChild(link);
  }
}

export function applyTheme(theme = getCurrentTheme(), root = null) {
  const ui = root ?? document.querySelector("#fabula-jrpg-ui");

  if (!ui || !theme) {
    return;
  }

  loadThemeStyles(theme.id);

  ui.dataset.theme = theme.id;
}

export function setCurrentTheme(themeId) {
  if (!THEMES[themeId]) {
    return;
  }

  game.settings.set("fabula-jrpg-ui", "theme", themeId);
}

export function getAvailableThemes() {
  return Object.values(THEMES);
}
