export function createCharacterCard(actor) {
  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  return `
        <div class="fabula-character" data-actor-id="${actor.id}">
            <div class="character-portrait">
                <img src="${actor.img}" alt="${actor.name}">
            </div>

            <div class="character-name">
                ${actor.name}
            </div>

            <div class="character-level">
                LV ${actor.system.level.value}
            </div>

            <div class="character-resources">
                ${createResource("hp", hp)}
                ${createResource("mp", mp)}
                ${createResource("ip", ip)}
            </div>
        </div>
    `;
}

function createResource(type, resource) {
  if (type === "ip") {
    const points = Array.from({ length: resource.max }, (_, index) => {
      const active = index < resource.value;

      return `
                    <span class="ip-point ${active ? "active" : ""}">
                        ◆
                    </span>
                `;
    }).join("");

    return `
            <div
                class="character-resource character-resource-ip"
                data-resource="ip"
            >
                <span>PI</span>

                <div class="ip-points">
                    ${points}
                </div>

                <span class="resource-value">
                    ${resource.value}/${resource.max}
                </span>
            </div>
        `;
  }

  const percentage = (resource.value / resource.max) * 100;

  return `
        <div
            class="character-resource"
            data-resource="${type}"
        >
            <span>${type.toUpperCase()}</span>

            <div class="resource-bar">
                <div
                    class="resource-fill ${type}"
                    style="width: ${percentage}%"
                ></div>
            </div>

            <span class="resource-value">
                ${resource.value}/${resource.max}
            </span>
        </div>
    `;
}

function updateResource(card, type, resource) {
  const resourceElement = card.querySelector(`[data-resource="${type}"]`);

  // PI usa pontos individuais
  if (type === "ip") {
    const pointsContainer = card.querySelector(".ip-points");

    if (!pointsContainer) return;

    pointsContainer.innerHTML = Array.from(
      { length: resource.max },
      (_, index) => {
        const active = index < resource.value;

        return `
                    <span class="ip-point ${active ? "active" : ""}">
                        ◆
                    </span>
                `;
      },
    ).join("");

    const value = resourceElement?.querySelector(".resource-value");

    if (value) {
      value.textContent = `${resource.value}/${resource.max}`;
    }

    return;
  }

  // HP / MP usam barra
  if (!resourceElement) return;

  const percentage = (resource.value / resource.max) * 100;

  const fill = resourceElement.querySelector(".resource-fill");
  const value = resourceElement.querySelector(".resource-value");

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  if (value) {
    value.textContent = `${resource.value}/${resource.max}`;
  }
}

export function updateCharacterCard(actor, ui) {
  const card = ui.querySelector(`[data-actor-id="${actor.id}"]`);

  if (!card) return;

  const hp = actor.system.resources.hp;
  const mp = actor.system.resources.mp;
  const ip = actor.system.resources.ip;

  card.querySelector(".character-name").textContent = actor.name;

  card.querySelector(".character-level").textContent =
    `LV ${actor.system.level.value}`;

  updateResource(card, "hp", hp);
  updateResource(card, "mp", mp);
  updateResource(card, "ip", ip);
}

export function updateActiveCombatant(combat, ui) {
  // Remove o destaque anterior
  ui.querySelectorAll(".fabula-character").forEach((card) => {
    card.classList.remove("active-turn");
  });

  const combatantId = combat.current?.combatantId;

  if (!combatantId) return;

  const combatant = combat.combatants.get(combatantId);

  if (!combatant?.actor) return;

  const card = ui.querySelector(`[data-actor-id="${combatant.actor.id}"]`);

  if (!card) return;

  card.classList.add("active-turn");
}
