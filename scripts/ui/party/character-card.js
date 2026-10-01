import { escapeHTML } from "../shared/html.js";
import { getPartyCard, getPartyCards } from "./party-card.js";

// =====================================================
// CREATE CHARACTER CARD
// =====================================================

export function createCharacterCard(member) {
  const actor = member.actor;
  const isKo = actor.statuses?.has("ko");
  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  return `
  <div
    class="fui-character-card${isKo ? " fui-ko" : ""}"
    data-actor-id="${actor.id}"
    data-fui-party-card
  >
    <div
      class="fui-character-selection"
      aria-hidden="true"
    ></div>

    <div class="fui-character-portrait">
      <img
        src="${escapeHTML(actor.img)}"
        alt="${escapeHTML(actor.name)}"
      />
      <div class="fui-character-status-effects">
        ${createStatusEffects(actor)}
      </div>
    </div>

    <div class="fui-character-resources">
      <div class="fui-character-name-row">
        <span class="fui-character-name">
          ${escapeHTML(actor.name)}
        </span>
        <span class="fui-character-level">
          NV. ${actor.system.level.value}
        </span>
      </div>

      ${createBarResource("hp", hp)}
      ${createBarResource("mp", mp)}
      ${createIpResource(ip)}
    </div>
  </div>
`;
}

// =====================================================
// RESOURCE CREATION
// =====================================================

function createBarResource(type, resource) {
  const percentage =
    resource.max > 0 ? (resource.value / resource.max) * 100 : 0;

  return `
    <div
      class="fui-character-resource fui-character-resource-${type}"
      data-resource="${type}"
    >
      <div class="fui-resource-header">
        <span class="fui-resource-label">
          ${type.toUpperCase()}
        </span>

        <span class="fui-resource-value">
          <span class="fui-resource-value-current">
            ${resource.value}
          </span>

          <span class="fui-resource-value-sep">/</span>

          <span class="fui-resource-value-max">
            ${resource.max}
          </span>
        </span>
      </div>

      <div class="fui-resource-bar">
        ${type === "hp" ? `<div class="fui-resource-crisis-marker"></div>` : ""}

        <div
          class="fui-resource-fill fui-${type}"
          style="width: ${percentage}%"
        ></div>
      </div>
    </div>
  `;
}

function createIpResource(resource) {
  const points = Array.from({ length: resource.max }, (_, index) => {
    const active = index < resource.value;

    return `
        <span class="fui-ip-point ${active ? "fui-active" : ""}">
          ${active ? "◆" : "◇"}
        </span>
      `;
  }).join("");

  return `
    <div
      class="fui-character-resource fui-character-resource-ip"
      data-resource="ip"
    >
      <div class="fui-resource-header">
        <span class="fui-resource-label">
          PI
        </span>
      </div>

      <div class="fui-ip-points">
        ${points}
      </div>
    </div>
  `;
}

function createStatusEffects(actor) {
  const effects = actor.effects.contents.filter(
    (effect) => effect.statuses?.size > 0 && effect.img,
  );

  return effects
    .map((effect) => {
      const statusName = effect.name ?? "Status";

      return `
        <div class="fui-status-icon">
          <img
            src="${escapeHTML(effect.img)}"
            alt="${escapeHTML(statusName)}"
          />
          <span class="fui-status-tooltip">
            ${escapeHTML(statusName)}
          </span>
        </div>
      `;
    })
    .join("");
}

// =====================================================
// RESOURCE UPDATES
// =====================================================

function updateBarResource(card, type, resource) {
  const resourceElement = card.querySelector(`[data-resource="${type}"]`);

  if (!resourceElement) {
    return;
  }

  const percentage =
    resource.max > 0 ? (resource.value / resource.max) * 100 : 0;

  const fill = resourceElement.querySelector(".fui-resource-fill");

  const current = resourceElement.querySelector(".fui-resource-value-current");

  const max = resourceElement.querySelector(".fui-resource-value-max");

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  if (current) {
    current.textContent = resource.value;
  }

  if (max) {
    max.textContent = resource.max;
  }

  resourceElement.classList.toggle(
    "fui-resource-critical",
    type === "hp" && resource.max > 0 && resource.value <= resource.max / 2,
  );
}

function updateIpResource(card, resource) {
  const resourceElement = card.querySelector(`[data-resource="ip"]`);

  if (!resourceElement) {
    return;
  }

  const pointsContainer = resourceElement.querySelector(".fui-ip-points");

  if (!pointsContainer) {
    return;
  }

  pointsContainer.innerHTML = Array.from(
    { length: resource.max },
    (_, index) => {
      const active = index < resource.value;

      return `
        <span class="fui-ip-point ${active ? "fui-active" : ""}">
          ${active ? "◆" : "◇"}
        </span>
      `;
    },
  ).join("");
}
// =====================================================
// STATUS UPDATES
// =====================================================

function updateStatusEffects(card, actor) {
  const container = card.querySelector(".fui-character-status-effects");
  if (!container) {
    return;
  }
  container.innerHTML = createStatusEffects(actor);
}

// =====================================================
// NAME / PORTRAIT UPDATES
// =====================================================

function updateIdentity(card, actor) {
  const name = card.querySelector(".fui-character-name");

  if (name) {
    name.textContent = actor.name;
  }

  const portrait = card.querySelector(".fui-character-portrait img");

  if (portrait) {
    if (portrait.getAttribute("src") !== actor.img) {
      portrait.setAttribute("src", actor.img);
    }

    portrait.alt = actor.name;
  }
}

// =====================================================
// CHARACTER CARD
// =====================================================

export function updateCharacterCard(actor, ui) {
  const card = ui.querySelector(`[data-actor-id="${actor.id}"]`);
  if (!card) return;

  const { hp, mp, ip } = actor.system.resources;

  updateBarResource(card, "hp", hp);
  updateBarResource(card, "mp", mp);
  updateIpResource(card, ip);
  updateStatusEffects(card, actor);
  updateIdentity(card, actor);

  card.classList.toggle("fui-ko", actor.statuses?.has("ko"));
}

// =====================================================
// ACTIVE COMBATANT
// =====================================================

export function updateActiveCombatant(combat, ui) {
  getPartyCards(ui).forEach((card) => {
    card.classList.remove("fui-active-turn");
  });

  const combatantId = combat?.current?.combatantId;

  if (!combatantId) {
    return;
  }

  const combatant = combat.combatants.get(combatantId);

  if (!combatant?.actor) {
    return;
  }

  const card = getPartyCard(combatant.actor.id, ui);

  if (!card) {
    return;
  }

  card.classList.add("fui-active-turn");
}
