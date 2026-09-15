const MODULE_ID = "fabula-jrpg-ui";

const DEFAULT_LAYOUT = {
  command: {
    x: 24,
    bottom: 30,
    scale: 1,
  },

  party: {
    x: 0.5,
    bottom: 24,
    scale: 1,
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
    command: {
      ...DEFAULT_LAYOUT.command,
      ...saved?.command,
    },

    party: {
      ...DEFAULT_LAYOUT.party,
      ...saved?.party,
    },
  };
}

export async function saveHudLayout(layout) {
  await game.settings.set(MODULE_ID, "hudLayout", layout);
}

export async function resetHudLayout() {
  await saveHudLayout({
    command: { ...DEFAULT_LAYOUT.command },
    party: { ...DEFAULT_LAYOUT.party },
  });
}

function getHudElements(ui, type) {
  const selectors = {
    command: {
      wrapper: ".fui-command-wrapper",
      content: ".fui-command",
    },

    party: {
      wrapper: ".fui-party-wrapper",
      content: ".fui-party-stats",
    },
  };

  const selector = selectors[type];

  if (!selector) return null;

  return {
    wrapper: ui.querySelector(selector.wrapper),
    content: ui.querySelector(selector.content),
  };
}

function getScale(layout, type) {
  return layout[type]?.scale ?? 1;
}

function applyPosition(wrapper, layout, type) {
  const position = layout[type];

  if (!wrapper || !position) return;

  wrapper.style.left =
    type === "party" ? `${position.x * 100}%` : `${position.x}px`;

  wrapper.style.bottom = `${position.bottom}px`;

  wrapper.style.top = "";
  wrapper.style.right = "";

  wrapper.style.transform = type === "party" ? "translateX(-50%)" : "none";
}

function applyScale(wrapper, content, layout, type) {
  if (!wrapper || !content) return;

  const scale = getScale(layout, type);

  wrapper.style.width = `${content.offsetWidth * scale}px`;
  wrapper.style.height = `${content.offsetHeight * scale}px`;

  content.style.transform = `scale(${scale})`;

  content.style.transformOrigin =
    type === "party" ? "center bottom" : "left bottom";
}

export function applyHudLayout(ui) {
  if (!ui) return;

  const layout = getHudLayout();

  for (const type of ["command", "party"]) {
    const elements = getHudElements(ui, type);

    if (!elements) continue;

    applyPosition(elements.wrapper, layout, type);
    applyScale(elements.wrapper, elements.content, layout, type);
  }
}

export function isHudEditing() {
  return isEditing;
}

export function enterHudEditMode(ui) {
  if (!ui || isEditing) return;

  isEditing = true;

  ui.classList.add("fui-hud-editing");

  for (const type of ["command", "party"]) {
    const { wrapper } = getHudElements(ui, type) ?? {};

    wrapper?.classList.add("fui-hud-editable");
  }

  createEditPanel(ui);
  setupHudDragging(ui);
}

function createEditPanel(ui) {
  if (ui.querySelector(".fui-hud-edit-panel")) return;

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

  for (const type of ["command", "party"]) {
    const { wrapper } = getHudElements(ui, type) ?? {};

    wrapper?.classList.remove("fui-hud-editable");
    wrapper?.classList.remove("fui-hud-dragging");
  }

  if (ui._fabulaHudEditKeydown) {
    document.removeEventListener("keydown", ui._fabulaHudEditKeydown);

    delete ui._fabulaHudEditKeydown;
  }

  ui.querySelector(".fui-hud-edit-panel")?.remove();
}

function setupHudDragging(ui) {
  for (const type of ["command", "party"]) {
    const { wrapper } = getHudElements(ui, type) ?? {};

    setupDraggable(ui, wrapper, type);
  }
}

function setupDraggable(ui, element, type) {
  if (!element) return;

  let dragging = false;
  let pointerId = null;
  let offsetX = 0;
  let offsetY = 0;
  let dragScale = 1;

  const onPointerDown = (event) => {
    if (!isEditing || event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = element.getBoundingClientRect();
    const layout = getHudLayout();

    dragScale = getScale(layout, type);

    dragging = true;
    pointerId = event.pointerId;

    element.setPointerCapture(pointerId);

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.transform = "none";

    element.dataset.dragScale = dragScale;

    element.classList.add("fui-hud-dragging");
  };

  const onPointerMove = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;

    event.preventDefault();

    let left = event.clientX - offsetX;
    let top = event.clientY - offsetY;

    const width = element.offsetWidth * dragScale;
    const height = element.offsetHeight * dragScale;

    const maxLeft = Math.max(0, window.innerWidth - width);

    const maxTop = Math.max(0, window.innerHeight - height);

    left = Math.max(0, Math.min(left, maxLeft));
    top = Math.max(0, Math.min(top, maxTop));

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  };

  const stopDragging = async (event) => {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;

    element.classList.remove("fui-hud-dragging");

    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }

    pointerId = null;

    delete element.dataset.dragScale;

    await saveDraggedPosition(element, type);

    applyHudLayout(ui);
  };

  element.addEventListener("pointerdown", onPointerDown);

  element.addEventListener("pointermove", onPointerMove);

  element.addEventListener("pointerup", stopDragging);

  element.addEventListener("pointercancel", stopDragging);
}

async function saveDraggedPosition(element, type) {
  const layout = getHudLayout();
  const rect = element.getBoundingClientRect();

  const position = {
    ...layout[type],
    bottom: window.innerHeight - rect.bottom,
  };

  if (type === "party") {
    position.x = (rect.left + rect.width / 2) / window.innerWidth;
  } else {
    position.x = rect.left;
  }

  layout[type] = position;

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

    for (const type of ["command", "party"]) {
      const field = `${type}Scale`;

      if (formData[field] !== undefined) {
        layout[type].scale = Number(formData[field]);
      }
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

    setupScaleSlider(root, "command", "Command");

    setupScaleSlider(root, "party", "Party");

    root
      .querySelector('[data-action="edit-position"]')
      ?.addEventListener("click", () => {
        this.close();

        const ui = document.querySelector("#fabula-jrpg-ui");

        if (ui) {
          enterHudEditMode(ui);
        }
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

function setupScaleSlider(root, type, label) {
  const slider = root.querySelector(`[name="${type}Scale"]`);

  const value = root.querySelector(`[data-scale-value="${type}"]`);

  if (!slider || !value) return;

  const updateValue = () => {
    value.textContent = Number(slider.value).toFixed(2);
  };

  slider.addEventListener("input", updateValue);

  updateValue();
}
