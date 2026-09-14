const CURSOR_TEXTURE_PATH = "modules/fabula-jrpg-ui/assets/cursor.png";

const CURSOR_SCALE = 1.5;
const CURSOR_OFFSET_Y = -120;
const CURSOR_ROTATION = Math.PI / 2;

const CURSOR_ANIMATION_DISTANCE = 8;
const CURSOR_ANIMATION_SPEED = 0.08;

export function createCanvasCursor() {
  const canvasGroup = canvas?.interface;

  if (!canvasGroup) {
    console.warn("Canvas Cursor | Interface canvas não disponível.");
    return {
      setFocusedToken() {},
      setSelectedTokens() {},
      destroy() {},
    };
  }

  let cursorTexture = null;
  let focusedToken = null;
  let selectedTokens = [];
  let entries = [];
  let destroyed = false;

  let tickerAttached = false;

  function createSprite(token, animated) {
    if (!cursorTexture || !token) {
      return null;
    }

    const sprite = new PIXI.Sprite(cursorTexture);

    sprite.anchor.set(0.5, 1);
    sprite.scale.set(CURSOR_SCALE);
    sprite.rotation = CURSOR_ROTATION;
    sprite.zIndex = 10000;

    sprite.eventMode = "none";
    sprite.interactiveChildren = false;

    sprite.visible = true;
    sprite.renderable = true;

    const entry = {
      token,
      sprite,
      animated,
      phase: Math.random() * Math.PI * 2,
      baseY: 0,
    };

    canvasGroup.addChild(sprite);

    updateEntryPosition(entry);

    return entry;
  }

  function updateEntryPosition(entry) {
    if (!entry?.sprite || !entry.token) {
      return;
    }

    const token = entry.token;

    if (!token.visible || !token.mesh?.visible) {
      entry.sprite.visible = false;
      return;
    }

    const center = token.center;

    if (!center) {
      entry.sprite.visible = false;
      return;
    }

    const tokenHeight = token.height ?? 0;

    entry.baseY = center.y - tokenHeight / 2 + CURSOR_OFFSET_Y;

    entry.sprite.x = center.x;

    if (entry.animated) {
      entry.sprite.y =
        entry.baseY + Math.sin(entry.phase) * CURSOR_ANIMATION_DISTANCE;
    } else {
      entry.sprite.y = entry.baseY;
    }

    entry.sprite.visible = true;
  }

  function destroyEntry(entry) {
    if (!entry?.sprite) {
      return;
    }

    entry.sprite.removeFromParent();
    entry.sprite.destroy();
  }

  function isSelectedToken(token) {
    return selectedTokens.includes(token);
  }

  function findEntry(token) {
    return entries.find((entry) => entry.token === token);
  }

  function rebuildEntries() {
    if (destroyed || !cursorTexture) {
      return;
    }

    entries.forEach(destroyEntry);
    entries = [];

    const tokens = [];

    if (focusedToken) {
      tokens.push({
        token: focusedToken,
        animated: isSelectedToken(focusedToken),
      });
    }

    selectedTokens.forEach((token) => {
      if (!token) {
        return;
      }

      if (tokens.some((entry) => entry.token === token)) {
        return;
      }

      tokens.push({
        token,
        animated: true,
      });
    });

    tokens.forEach(({ token, animated }) => {
      const entry = createSprite(token, animated);

      if (entry) {
        entries.push(entry);
      }
    });
  }

  function updateAnimationState() {
    if (destroyed) {
      return;
    }

    entries.forEach((entry) => {
      const selected = isSelectedToken(entry.token);

      entry.animated = selected;

      if (!selected) {
        entry.sprite.y = entry.baseY;
        return;
      }

      entry.phase += CURSOR_ANIMATION_SPEED;

      entry.sprite.y =
        entry.baseY + Math.sin(entry.phase) * CURSOR_ANIMATION_DISTANCE;
    });
  }

  function sync() {
    if (destroyed || !cursorTexture) {
      return;
    }

    entries.forEach((entry) => {
      const stillFocused = entry.token === focusedToken;
      const stillSelected = isSelectedToken(entry.token);

      if (!stillFocused && !stillSelected) {
        return;
      }

      entry.animated = stillSelected;

      updateEntryPosition(entry);
    });

    rebuildEntries();
  }

  function attachTicker() {
    if (tickerAttached) {
      return;
    }

    if (!canvas?.app?.ticker) {
      return;
    }

    canvas.app.ticker.add(updateAnimationState);

    tickerAttached = true;
  }

  function loadTexture() {
    PIXI.Assets.load(CURSOR_TEXTURE_PATH)
      .then((texture) => {
        if (destroyed) {
          return;
        }

        cursorTexture = texture;

        console.log(
          "Canvas Cursor | Texture carregada:",
          texture?.width,
          texture?.height,
          texture?.valid,
        );

        attachTicker();
        rebuildEntries();
      })
      .catch((error) => {
        console.error("Canvas Cursor | Erro ao carregar textura:", error);
      });
  }

  function setFocusedToken(token) {
    if (destroyed) {
      return;
    }

    focusedToken = token ?? null;

    console.log("Canvas Cursor | Focus:", focusedToken?.name ?? null);

    if (!cursorTexture) {
      return;
    }

    rebuildEntries();
  }

  function setSelectedTokens(tokens) {
    if (destroyed) {
      return;
    }

    selectedTokens = Array.isArray(tokens) ? tokens.filter(Boolean) : [];

    console.log(
      "Canvas Cursor | Selected:",
      selectedTokens.map((token) => token.name),
    );

    if (!cursorTexture) {
      return;
    }

    rebuildEntries();
  }

  function destroy() {
    if (destroyed) {
      return;
    }

    destroyed = true;

    if (tickerAttached && canvas?.app?.ticker) {
      canvas.app.ticker.remove(updateAnimationState);
      tickerAttached = false;
    }

    entries.forEach(destroyEntry);
    entries = [];

    focusedToken = null;
    selectedTokens = [];
    cursorTexture = null;
  }

  loadTexture();

  return {
    setFocusedToken,
    setSelectedTokens,
    destroy,
  };
}
