import { createCanvasTargetVisual } from "./canvas-target-visual.js";
import { createCardTargetVisual } from "./card-target-visual.js";

// =====================================================
// TARGET VISUAL
// =====================================================

export function createTargetVisual(type = "canvas") {
  if (type === "card") {
    return createCardTargetVisual();
  }

  return createCanvasTargetVisual();
}

export function createThemeTargetVisuals(theme) {
  return {
    party: createTargetVisual(theme.targetVisuals?.party),

    enemies: createTargetVisual(theme.targetVisuals?.enemies),
  };
}
