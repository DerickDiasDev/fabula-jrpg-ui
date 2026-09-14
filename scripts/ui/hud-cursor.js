// =====================================================
// HUD CURSOR (compartilhado)
// =====================================================
//
// Cursor flutuante usado em todos os menus/submenus da
// HUD (Command, Attack, Skill, Item, Target Count,
// Target Select, Confirm, e futuros submenus).
//
// Responsabilidade única: desenhar e posicionar o
// cursor sobre o botão atualmente focado. Este módulo
// NÃO sabe nada sobre seleção, navegação ou lógica de
// cada menu - cada menu continua decidindo QUAL botão
// está focado; aqui só desenhamos o cursor em cima
// dele.
//
// Este é o cursor da HUD (interface). NÃO confundir
// com o cursor do Canvas, que aponta para Tokens
// durante a seleção de alvos - esse é um sistema
// totalmente separado (ver roadmap).
//
// =====================================================
// USO
// =====================================================
//
//   const cursor = createHudCursor(menu);
//
//   // sempre que o botão focado mudar:
//   cursor.update(button);
//
//   // quando não houver botão focado (ex: lista vazia):
//   cursor.update(null); // ou cursor.hide();
//
// O elemento é anexado como filho direto de `menu`, que
// precisa ser um container posicionado (position:
// relative/absolute/fixed) - todos os menus da HUD já
// são.
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

    // getBoundingClientRect() já reflete a posição
    // visual real do botão, inclusive quando ele está
    // dentro de uma lista com scroll - não precisamos
    // calcular offsetTop/scrollTop manualmente.

    const menuRect = menu.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    cursor.style.top = `${buttonRect.top - menuRect.top}px`;
    cursor.style.height = `${button.offsetHeight}px`;

    cursor.classList.add("fui-cursor-visible");
  }

  function hide() {
    cursor.classList.remove("fui-cursor-visible");
  }

  return { element: cursor, update, hide };
}
