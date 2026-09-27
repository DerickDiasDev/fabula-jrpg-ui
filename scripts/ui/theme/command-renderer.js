export function createCommandRenderer(theme) {
  if (theme.id === "wizardry") {
    return createWizardryCommandRenderer();
  }

  return createOctopathCommandRenderer();
}

function createOctopathCommandRenderer() {
  return {
    render(currentActorName = "") {
      return `
        <div
          class="fui-command"
          data-actor-name="${currentActorName}"
        >
          <button class="fui-command-button fui-active">
            <span>Attack</span>
          </button>
          <button class="fui-command-button">
            <span>Skill</span>
          </button>
          <button class="fui-command-button">
            <span>Study</span>
          </button>
          <button class="fui-command-button">
            <span>Guard</span>
          </button>
          <button class="fui-command-button">
            <span>Item</span>
          </button>
          <button class="fui-command-button">
            <span>Equipment</span>
          </button>
          <button class="fui-command-button">
            <span>Hinder</span>
          </button>
          <button class="fui-command-button">
            <span>Objective</span>
          </button>
        </div>
      `;
    },
  };
}

function createWizardryCommandRenderer() {
  return {
    render() {
      return "";
    },
  };
}
