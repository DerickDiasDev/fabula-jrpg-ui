const MODULE_ID = "fabula-jrpg-ui";

const MINIMIZED_SETTING = "partyMinimized";

// =====================================================
// PARTY MINIMIZE
// =====================================================
//
// Preferência local (client) de cada usuário: esconde os
// cards da Party, mantendo só o botão para restaurá-los.
// =====================================================

export function registerPartyMinimizeSettings() {
  game.settings.register(MODULE_ID, MINIMIZED_SETTING, {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });
}

export function isPartyMinimized() {
  return Boolean(game.settings.get(MODULE_ID, MINIMIZED_SETTING));
}

export function applyPartyMinimized(ui, minimized = isPartyMinimized()) {
  const wrapper = ui?.querySelector(".fui-party-wrapper");

  if (!wrapper) {
    return;
  }

  wrapper.classList.toggle("fui-party-minimized", minimized);

  const toggle = wrapper.querySelector(".fui-party-minimize-toggle");

  if (toggle) {
    toggle.setAttribute("aria-pressed", String(minimized));

    toggle.title = minimized ? "Show Party" : "Hide Party";

    toggle
      .querySelector("i")
      ?.setAttribute(
        "class",
        minimized ? "fas fa-chevron-up" : "fas fa-chevron-down",
      );
  }
}

// `onChange` roda depois de aplicar o estado (o HUD recalcula
// o layout, que depende do tamanho dos cards visíveis).
export function setupPartyMinimizeToggle(ui, onChange) {
  const toggle = ui?.querySelector(".fui-party-minimize-toggle");

  toggle?.addEventListener("click", () => {
    const wrapper = ui.querySelector(".fui-party-wrapper");

    const minimized = !wrapper?.classList.contains("fui-party-minimized");

    // O estado visual é aplicado na hora; salvar o setting
    // (assíncrono) não deve atrasar a resposta ao clique.
    applyPartyMinimized(ui, minimized);

    onChange?.();

    game.settings.set(MODULE_ID, MINIMIZED_SETTING, minimized);
  });
}
