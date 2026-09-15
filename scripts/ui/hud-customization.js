const MODULE_ID = "fabula-jrpg-ui";

const DEFAULT_LAYOUT = {
  scale: 1,

  command: {
    x: 24,
    bottom: 30,
  },

  party: {
    x: 0.5,
    bottom: 24,
  },
};

let isEditing = false;

export function registerHudSettings() {
  game.settings.register(MODULE_ID, "hudLayout", {
    name: "HUD Layout",
    scope: "client",
    config: false,
    type: Object,
    default: DEFAULT_LAYOUT,
  });

  game.settings.registerMenu(MODULE_ID, "hudCustomization", {
    name: "HUD Customization",
    label: "Customize HUD",
    hint: "Customize the position and appearance of the Fabula JRPG HUD.",
    icon: "fas fa-gamepad",
    type: FabulaHudConfig,
    restricted: false,
  });
}

export function getHudLayout() {
  const saved = game.settings.get(MODULE_ID, "hudLayout");

  return {
    scale: saved?.scale ?? DEFAULT_LAYOUT.scale,

    command: {
      x: saved?.command?.x ?? DEFAULT_LAYOUT.command.x,
      bottom: saved?.command?.bottom ?? DEFAULT_LAYOUT.command.bottom,
    },

    party: {
      x: saved?.party?.x ?? DEFAULT_LAYOUT.party.x,
      bottom: saved?.party?.bottom ?? DEFAULT_LAYOUT.party.bottom,
    },
  };
}

export async function saveHudLayout(layout) {
  await game.settings.set(MODULE_ID, "hudLayout", layout);
}

export async function resetHudLayout() {
  await game.settings.set(MODULE_ID, "hudLayout", {
    scale: DEFAULT_LAYOUT.scale,

    command: {
      ...DEFAULT_LAYOUT.command,
    },

    party: {
      ...DEFAULT_LAYOUT.party,
    },
  });
}

export function applyHudLayout(ui) {
  if (!ui) return;

  const layout = getHudLayout();

  const command = ui.querySelector(".fui-command");
  const party = ui.querySelector(".fui-party-stats");

  if (command) {
    command.style.left = `${layout.command.x}px`;
    command.style.bottom = `${layout.command.bottom}px`;

    // Remove qualquer posição temporária usada durante o drag.
    command.style.top = "";
    command.style.right = "";
    command.style.transform = "";
  }

  if (party) {
    party.style.left = `${layout.party.x * 100}%`;
    party.style.bottom = `${layout.party.bottom}px`;

    // Remove qualquer posição temporária usada durante o drag.
    party.style.top = "";
    party.style.right = "";
    party.style.transform = "";
  }
}
export function isHudEditing() {
  return isEditing;
}

export function enterHudEditMode(ui) {
  if (!ui || isEditing) return;

  isEditing = true;

  ui.classList.add("fui-hud-editing");

  const command = ui.querySelector(".fui-command");
  const party = ui.querySelector(".fui-party-stats");

  command?.classList.add("fui-hud-editable");
  party?.classList.add("fui-hud-editable");

  createEditPanel(ui);
  setupHudDragging(ui);
}

function createEditPanel(ui) {
  const existingPanel = ui.querySelector(".fui-hud-edit-panel");

  if (existingPanel) return;

  const panel = document.createElement("div");
  panel.className = "fui-hud-edit-panel";

  panel.innerHTML = `
    <div class="fui-hud-edit-title">
      HUD EDIT MODE
    </div>

    <div class="fui-hud-edit-help">
      Drag Command and Party to reposition them.
    </div>

    <div class="fui-hud-edit-actions">
      <button type="button" data-action="finish-edit">
        <i class="fas fa-check"></i>
        Finish Editing
      </button>

      <button type="button" data-action="reset-edit">
        <i class="fas fa-undo"></i>
        Reset
      </button>
    </div>
  `;

  ui.appendChild(panel);

  panel
    .querySelector('[data-action="finish-edit"]')
    ?.addEventListener("click", () => {
      finishHudEditMode(ui);
    });

  panel
    .querySelector('[data-action="reset-edit"]')
    ?.addEventListener("click", async () => {
      await resetHudLayout();
      applyHudLayout(ui);
    });

  const keydownHandler = (event) => {
    if (event.key !== "Escape") return;

    event.preventDefault();
    event.stopPropagation();

    finishHudEditMode(ui);
  };

  ui._fabulaHudEditKeydown = keydownHandler;

  document.addEventListener("keydown", keydownHandler);
}

export function finishHudEditMode(ui) {
  if (!ui || !isEditing) return;

  exitHudEditMode(ui);
}

export function exitHudEditMode(ui) {
  if (!ui || !isEditing) return;

  isEditing = false;

  ui.classList.remove("fui-hud-editing");

  const command = ui.querySelector(".fui-command");
  const party = ui.querySelector(".fui-party-stats");

  command?.classList.remove("fui-hud-editable");
  party?.classList.remove("fui-hud-editable");

  if (ui._fabulaHudEditKeydown) {
    document.removeEventListener("keydown", ui._fabulaHudEditKeydown);

    delete ui._fabulaHudEditKeydown;
  }

  ui.querySelector(".fui-hud-edit-panel")?.remove();
}

function setupHudDragging(ui) {
  const command = ui.querySelector(".fui-command");
  const party = ui.querySelector(".fui-party-stats");

  setupDraggable(ui, command, "command");
  setupDraggable(ui, party, "party");
}

function setupDraggable(ui, element, type) {
  if (!element) return;

  let dragging = false;
  let pointerId = null;
  let offsetX = 0;
  let offsetY = 0;

  const onPointerDown = (event) => {
    if (!isEditing) return;
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = element.getBoundingClientRect();

    dragging = true;
    pointerId = event.pointerId;

    element.setPointerCapture(pointerId);

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    /*
     * Primeiro congelamos a posição visual atual
     * em coordenadas absolutas.
     */
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;

    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.transform = "none";

    element.classList.add("fui-hud-dragging");
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    if (event.pointerId !== pointerId) return;

    event.preventDefault();

    let left = event.clientX - offsetX;
    let top = event.clientY - offsetY;

    const maxLeft = window.innerWidth - element.offsetWidth;
    const maxTop = window.innerHeight - element.offsetHeight;

    left = Math.max(0, Math.min(left, maxLeft));
    top = Math.max(0, Math.min(top, maxTop));

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  };

  const stopDragging = async (event) => {
    if (!dragging) return;
    if (event.pointerId !== pointerId) return;

    dragging = false;

    element.classList.remove("fui-hud-dragging");

    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    pointerId = null;

    await saveDraggedPosition(ui, element, type);

    /*
     * Converte novamente a posição temporária
     * para o sistema normal do HUD.
     */
    applyHudLayout(ui);
  };

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", stopDragging);
  element.addEventListener("pointercancel", stopDragging);
}

async function saveDraggedPosition(ui, element, type) {
  const layout = getHudLayout();
  const rect = element.getBoundingClientRect();

  if (type === "command") {
    layout.command = {
      x: rect.left,
      bottom: window.innerHeight - rect.bottom,
    };
  }

  if (type === "party") {
    const centerX = rect.left + rect.width / 2;

    layout.party = {
      x: centerX / window.innerWidth,
      bottom: window.innerHeight - rect.bottom,
    };
  }

  await saveHudLayout(layout);
}

class FabulaHudConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "fabula-jrpg-ui-hud-config",
      title: "Fabula JRPG UI — HUD Customization",
      template: "modules/fabula-jrpg-ui/templates/hud-customization.hbs",
      width: 420,
      height: "auto",
      closeOnSubmit: false,
    });
  }

  getData() {
    return {
      layout: getHudLayout(),
    };
  }

  async _updateObject(event, formData) {
    const layout = getHudLayout();

    if (formData.scale !== undefined) {
      layout.scale = Number(formData.scale);
    }

    await saveHudLayout(layout);

    const ui = document.querySelector("#fabula-jrpg-ui");

    if (ui) {
      applyHudLayout(ui);
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    const root = html[0] ?? html;

    root
      .querySelector('[data-action="edit-position"]')
      ?.addEventListener("click", () => {
        this.close();

        const ui = document.querySelector("#fabula-jrpg-ui");

        if (!ui) return;

        enterHudEditMode(ui);
      });

    root
      .querySelector('[data-action="reset-position"]')
      ?.addEventListener("click", async () => {
        await resetHudLayout();

        const ui = document.querySelector("#fabula-jrpg-ui");

        if (ui) {
          applyHudLayout(ui);
        }

        this.render();
      });
  }
}
