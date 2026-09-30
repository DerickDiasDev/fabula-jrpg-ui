// =====================================================
// WIZARDRY PARTY RENDERER
// =====================================================

export function createWizardryPartyRenderer() {
  return {
    render(members) {
      const addToCombatButton = game.user.isGM
        ? `
          <button
            type="button"
            class="fui-wizardry-add-to-combat"
          >
            Add to Combat
          </button>
        `
        : "";

      return `
        <div class="fui-wizardry-party">
          <div class="fui-wizardry-party-grid">
            ${members.map(createWizardryCharacterCard).join("")}
          </div>
          ${addToCombatButton}
        </div>
      `;
    },

    updateCharacterCard: updateWizardryCharacterCard,
  };
}

// =====================================================
// UPDATE CHARACTER CARD
// =====================================================

export function updateWizardryCharacterCard(actor) {
  const card = document.querySelector(
    `.fui-wizardry-character[data-actor-id="${actor.id}"]`,
  );

  if (!card) return;

  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  // ---------------------------------------------------
  // KO
  // ---------------------------------------------------

  card.classList.toggle("fui-ko", actor.statuses?.has("ko"));

  // ---------------------------------------------------
  // HP
  // ---------------------------------------------------

  updateWizardryResource(card, "hp", hp);

  // ---------------------------------------------------
  // MP
  // ---------------------------------------------------

  updateWizardryResource(card, "mp", mp);

  // ---------------------------------------------------
  // IP
  // ---------------------------------------------------

  updateWizardryIp(card, ip);

  // ---------------------------------------------------
  // ATTRIBUTES
  // ---------------------------------------------------

  updateWizardryAttribute(
    card,
    "DEX",
    actor.system.attributes.dex.current,
    getAttributeModifier(actor, "dex"),
  );

  updateWizardryAttribute(
    card,
    "INS",
    actor.system.attributes.ins.current,
    getAttributeModifier(actor, "ins"),
  );

  updateWizardryAttribute(
    card,
    "MIG",
    actor.system.attributes.mig.current,
    getAttributeModifier(actor, "mig"),
  );

  updateWizardryAttribute(
    card,
    "WLP",
    actor.system.attributes.wlp.current,
    getAttributeModifier(actor, "wlp"),
  );

  // ---------------------------------------------------
  // STATUS EFFECTS
  // ---------------------------------------------------

  const statusContainer = card.querySelector(
    ".fui-wizardry-character-status-effects",
  );

  if (statusContainer) {
    statusContainer.innerHTML = createStatusEffects(actor);
  }
}

// =====================================================
// UPDATE RESOURCE
// =====================================================

function updateWizardryResource(card, type, resource) {
  const element = card.querySelector(`.fui-wizardry-resource-${type}`);

  if (!element) return;

  const { value, max } = resource;

  const percentage = max > 0 ? (value / max) * 100 : 0;

  const isCritical = type === "hp" && max > 0 && value <= max / 2;

  const current = element.querySelector(".fui-wizardry-value-current");

  const maxElement = element.querySelector(".fui-wizardry-value-max");

  const fill = element.querySelector(".fui-wizardry-resource-fill");

  if (current) {
    current.textContent = value;
  }

  if (maxElement) {
    maxElement.textContent = `/${max}`;
  }

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  element.classList.toggle("fui-resource-critical", isCritical);
}

// =====================================================
// UPDATE IP
// =====================================================

function updateWizardryIp(card, resource) {
  const element = card.querySelector(".fui-wizardry-resource-ip");

  if (!element) return;

  const pad = (n) => String(n).padStart(2, "0");

  const percentage =
    resource.max > 0 ? (resource.value / resource.max) * 100 : 0;

  const current = element.querySelector(".fui-wizardry-value-current");

  const max = element.querySelector(".fui-wizardry-value-max");

  const fill = element.querySelector(".fui-wizardry-resource-fill");

  if (current) {
    current.textContent = pad(resource.value);
  }

  if (max) {
    max.textContent = `/${pad(resource.max)}`;
  }

  if (fill) {
    fill.style.width = `${percentage}%`;
  }
}

// =====================================================
// UPDATE ATTRIBUTE
// =====================================================

function updateWizardryAttribute(card, label, value, modifier) {
  const attributes = card.querySelectorAll(".fui-wizardry-attribute");

  const attribute = [...attributes].find(
    (element) =>
      element
        .querySelector(".fui-wizardry-attribute-label")
        ?.textContent.trim() === label,
  );

  if (!attribute) return;

  const valueElement = attribute.querySelector(".fui-wizardry-attribute-value");

  if (valueElement) {
    valueElement.textContent = value;
  }

  const oldModifier = attribute.querySelector(
    ".fui-wizardry-attribute-modifier",
  );

  oldModifier?.remove();

  if (modifier === 0) return;

  const indicator = document.createElement("span");

  indicator.className =
    `fui-wizardry-attribute-modifier ` +
    (modifier > 0
      ? "fui-wizardry-attribute-modifier-up"
      : "fui-wizardry-attribute-modifier-down");

  indicator.textContent = modifier > 0 ? "▲" : "▼";

  attribute.appendChild(indicator);
}

// =====================================================
// CHARACTER CARD
// =====================================================

function createWizardryCharacterCard(member) {
  const actor = member.actor;
  const isKo = actor.statuses?.has("ko");

  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  return `
    <div
      class="fui-wizardry-character${isKo ? " fui-ko" : ""}${mp.max >= 100 ? " fui-wizardry-mp-long" : ""}"
      data-actor-id="${actor.id}"
    >
      <div class="fui-wizardry-character-name">
        ${actor.name}
      </div>

      <button
        type="button"
        class="fui-wizardry-character-card"
        data-actor-id="${actor.id}"
      >
        <div class="fui-wizardry-character-portrait">
          <img
            src="${actor.img}"
            alt="${actor.name}"
          />

          <div class="fui-wizardry-character-status-effects">
            ${createStatusEffects(actor)}
          </div>
        </div>

        <div class="fui-wizardry-character-body">
          <div class="fui-wizardry-character-resources">
            ${createResource("hp", hp)}
            ${createResource("mp", mp)}
            ${createIpResource(ip)}
          </div>

          <div class="fui-wizardry-character-attributes">
            ${createAttribute(
              "DEX",
              actor.system.attributes.dex.current,
              getAttributeModifier(actor, "dex"),
            )}

            ${createAttribute(
              "INS",
              actor.system.attributes.ins.current,
              getAttributeModifier(actor, "ins"),
            )}

            ${createAttribute(
              "MIG",
              actor.system.attributes.mig.current,
              getAttributeModifier(actor, "mig"),
            )}

            ${createAttribute(
              "WLP",
              actor.system.attributes.wlp.current,
              getAttributeModifier(actor, "wlp"),
            )}
          </div>
        </div>
      </button>
    </div>
  `;
}

// =====================================================
// RESOURCE
// =====================================================

function createResource(type, resource) {
  const { value, max } = resource;

  const percentage = max > 0 ? (value / max) * 100 : 0;

  const isCritical = type === "hp" && max > 0 && value <= max / 2;

  return `
    <div
      class="
        fui-wizardry-resource
        fui-wizardry-resource-${type}
        ${isCritical ? "fui-resource-critical" : ""}
      "
      data-resource="${type}"
    >
      <div class="fui-wizardry-resource-header">

        <span class="fui-wizardry-resource-label">
          ${type.toUpperCase()}
        </span>

        <span class="fui-wizardry-resource-value">
          <span class="fui-wizardry-value-current">
            ${value}
          </span>

          <span class="fui-wizardry-value-max">
            /${max}
          </span>
        </span>

      </div>

      <div class="fui-wizardry-resource-bar">

        ${
          type === "hp"
            ? `<div class="fui-wizardry-resource-crisis-marker"></div>`
            : ""
        }

        <div
          class="fui-wizardry-resource-fill"
          style="width: ${percentage}%"
        ></div>

      </div>
    </div>
  `;
}

// =====================================================
// IP
// =====================================================

function createIpResource(resource) {
  const pad = (n) => String(n).padStart(2, "0");

  const percentage =
    resource.max > 0 ? (resource.value / resource.max) * 100 : 0;

  return `
    <div
      class="fui-wizardry-resource fui-wizardry-resource-ip"
      data-resource="ip"
    >
      <div class="fui-wizardry-resource-header">

        <span class="fui-wizardry-resource-label">
          IP
        </span>

        <span class="fui-wizardry-resource-value">
          <span class="fui-wizardry-value-current">
            ${pad(resource.value)}
          </span>

          <span class="fui-wizardry-value-max">
            /${pad(resource.max)}
          </span>
        </span>

      </div>

      <div class="fui-wizardry-resource-bar">

        <div
          class="fui-wizardry-resource-fill"
          style="width: ${percentage}%"
        ></div>

      </div>
    </div>
  `;
}

// =====================================================
// ATTRIBUTE MODIFIER
// =====================================================

function getAttributeModifier(actor, attribute) {
  const key = `system.attributes.${attribute}`;

  let modifier = 0;

  for (const effect of actor.effects) {
    if (effect.disabled) continue;

    for (const change of effect.changes) {
      if (change.key !== key) continue;

      if (change.value === "upgrade") {
        modifier++;
      }

      if (change.value === "downgrade") {
        modifier--;
      }
    }
  }

  return modifier;
}

// =====================================================
// ATTRIBUTE
// =====================================================

function createAttribute(label, value, modifier = 0) {
  let indicator = "";

  if (modifier > 0) {
    indicator = `
      <span
        class="fui-wizardry-attribute-modifier fui-wizardry-attribute-modifier-up"
      >
        ▲
      </span>
    `;
  } else if (modifier < 0) {
    indicator = `
      <span
        class="fui-wizardry-attribute-modifier fui-wizardry-attribute-modifier-down"
      >
        ▼
      </span>
    `;
  }

  return `
    <div class="fui-wizardry-attribute">

      <span class="fui-wizardry-attribute-label">
        ${label}
      </span>

      <span class="fui-wizardry-attribute-value">
        ${value}
      </span>

      ${indicator}

    </div>
  `;
}

// =====================================================
// STATUS EFFECTS
// =====================================================

function createStatusEffects(actor) {
  const effects = actor.effects.contents.filter(
    (effect) => effect.statuses?.size > 0 && effect.img,
  );

  return effects
    .map((effect) => {
      const statusName = effect.name ?? "Status";

      return `
        <div class="fui-wizardry-status-icon">

          <img
            src="${effect.img}"
            alt="${statusName}"
          />

          <span class="fui-wizardry-status-tooltip">
            ${statusName}
          </span>

        </div>
      `;
    })
    .join("");
}
