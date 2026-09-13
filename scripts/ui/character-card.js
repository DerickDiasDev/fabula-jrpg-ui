export function createCharacterCard(actor) {
  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  return `
    <div
      class="fabula-character-card"
      data-actor-id="${actor.id}"
    >
      <div class="character-portrait">
        <img
          src="${actor.img}"
          alt="${actor.name}"
        />
      </div>

      <div class="character-resources">
        <div class="character-name-row">
          <span class="character-name">${actor.name}</span>
          <span class="character-level">NV. ${actor.system.level.value}</span>
        </div>

        ${createBarResource("hp", hp)}
        ${createBarResource("mp", mp)}
        ${createIpResource(ip)}
      </div>

      <div class="character-status-effects"></div>
    </div>
  `;
}

function createBarResource(type, resource) {
  const percentage =
    resource.max > 0 ? (resource.value / resource.max) * 100 : 0;

  return `
    <div
      class="character-resource character-resource-${type}"
      data-resource="${type}"
    >
      <div class="resource-header">
        <span class="resource-label">${type.toUpperCase()}</span>
        <span class="resource-value">
          <span class="resource-value-current">${resource.value}</span
          ><span class="resource-value-sep">/</span
          ><span class="resource-value-max">${resource.max}</span>
        </span>
      </div>

      <div class="resource-bar">
        ${type === "hp" ? `<div class="resource-crisis-marker"></div>` : ""}

        <div
          class="resource-fill ${type}"
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
        <span class="ip-point ${active ? "active" : ""}">${active ? "◆" : "◇"}</span>
      `;
  }).join("");

  return `
    <div
      class="character-resource character-resource-ip"
      data-resource="ip"
    >
      <div class="resource-header">
        <span class="resource-label">PI</span>
      </div>

      <div class="ip-points">
        ${points}
      </div>
    </div>
  `;
}

function updateBarResource(card, type, resource) {
  const resourceElement = card.querySelector(`[data-resource="${type}"]`);

  if (!resourceElement) {
    return;
  }

  const percentage =
    resource.max > 0 ? (resource.value / resource.max) * 100 : 0;

  const fill = resourceElement.querySelector(".resource-fill");
  const current = resourceElement.querySelector(".resource-value-current");
  const max = resourceElement.querySelector(".resource-value-max");

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
    "resource-critical",
    type === "hp" && resource.max > 0 && resource.value <= resource.max / 2,
  );
}

function updateIpResource(card, resource) {
  const resourceElement = card.querySelector(`[data-resource="ip"]`);

  if (!resourceElement) {
    return;
  }

  const pointsContainer = resourceElement.querySelector(".ip-points");

  if (pointsContainer) {
    pointsContainer.innerHTML = Array.from(
      { length: resource.max },
      (_, index) => {
        const active = index < resource.value;

        return `<span class="ip-point ${active ? "active" : ""}">${active ? "◆" : "◇"}</span>`;
      },
    ).join("");
  }
}

export function updateCharacterCard(actor, ui) {
  const card = ui.querySelector(`[data-actor-id="${actor.id}"]`);

  if (!card) {
    return;
  }

  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  updateBarResource(card, "hp", hp);
  updateBarResource(card, "mp", mp);
  updateIpResource(card, ip);
}

export function updateActiveCombatant(combat, ui) {
  ui.querySelectorAll(".fabula-character-card").forEach((card) => {
    card.classList.remove("active-turn");
  });

  const combatantId = combat.current?.combatantId;

  if (!combatantId) {
    return;
  }

  const combatant = combat.combatants.get(combatantId);

  if (!combatant?.actor) {
    return;
  }

  const card = ui.querySelector(`[data-actor-id="${combatant.actor.id}"]`);

  if (!card) {
    return;
  }

  card.classList.add("active-turn");
}
