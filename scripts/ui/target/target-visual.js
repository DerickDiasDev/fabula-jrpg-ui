import { createCanvasCursor } from "../shared/canvas-cursor.js";

// =====================================================
// TARGET VISUAL
// =====================================================

export function createCanvasTargetVisual() {
  const canvasCursor = createCanvasCursor();

  function getToken(combatantId) {
    const combatant = game.combat?.combatants.get(combatantId);
    return combatant?.token?.object ?? null;
  }

  function setFocusedTarget(combatantId) {
    const token = combatantId ? getToken(combatantId) : null;
    canvasCursor.setFocusedToken(token);
  }

  function setSelectedTargets(combatantIds) {
    const tokens = combatantIds.map(getToken).filter(Boolean);
    canvasCursor.setSelectedTokens(tokens);
  }

  function destroy() {
    canvasCursor.destroy();
  }

  return {
    setFocusedTarget,
    setSelectedTargets,
    destroy,
  };
}
