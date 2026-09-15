// =====================================================
// HUD CURSOR
// =====================================================
//
// Cursor visual compartilhado pelos menus da HUD.
//
// Responsabilidade única:
// - criar o cursor;
// - posicioná-lo sobre o botão focado;
// - esconder o cursor quando não houver botão.
//
// Este módulo NÃO controla:
// - seleção;
// - navegação;
// - ações;
// - lógica dos menus.
//
// Cada menu decide qual botão está focado e chama:
//
//   cursor.update(button);
//
// O cursor do Canvas é um sistema separado.
// =====================================================

export function createHudCursor(menu) {
  const cursor = document.createElement("div");

  cursor.className = "fui-cursor";

  menu.appendChild(cursor);

  function update(button) {
    if (!button) {
      hide();
      return;
    }

    const menuRect = menu.getBoundingClientRect();

    const buttonRect = button.getBoundingClientRect();

    cursor.style.top = `${buttonRect.top - menuRect.top}px`;

    cursor.style.height = `${button.offsetHeight}px`;

    cursor.classList.add("fui-cursor-visible");
  }

  function hide() {
    cursor.classList.remove("fui-cursor-visible");
  }

  return {
    element: cursor,
    update,
    hide,
  };
}
