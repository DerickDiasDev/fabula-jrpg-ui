// =====================================================
// HTML ESCAPE
// =====================================================
//
// Escapa valores vindos de dados do Foundry (nomes de
// Actors, Items, efeitos, caminhos de imagem) antes de
// inseri-los em templates HTML via innerHTML.
// =====================================================

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPES[character],
  );
}
