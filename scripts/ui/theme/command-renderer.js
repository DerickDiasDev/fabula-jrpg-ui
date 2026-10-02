import { escapeHTML } from "../shared/html.js";

export function createCommandRenderer(theme) {
  return createOctopathCommandRenderer();
}

function createOctopathCommandRenderer() {
  function renderButtons(commands = []) {
    return commands
      .map(
        (command, index) => `
          <button
            class="fui-command-button ${index === 0 ? "fui-active" : ""}"
            data-command="${escapeHTML(command.id)}"
            ${
              command.description
                ? `data-description="${escapeHTML(command.description)}"`
                : ""
            }
          >
            <span>${escapeHTML(command.label)}</span>
          </button>
        `,
      )
      .join("");
  }

  return {
    render(currentActorName = "", commands = []) {
      return `
        <div
          class="fui-command"
          data-actor-name="${escapeHTML(currentActorName)}"
        >
          ${renderButtons(commands)}
        </div>
      `;
    },

    renderButtons,
  };
}
