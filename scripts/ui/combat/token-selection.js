// =====================================================
// FIND TOKEN FOR ACTOR
// =====================================================

export function getTokenForActor(actor) {
  if (!actor || !canvas?.tokens) {
    return null;
  }

  return (
    canvas.tokens.placeables.find((token) => token.actor?.id === actor.id) ??
    null
  );
}

// =====================================================
// GET CONTROLLED ACTORS
// =====================================================

export function getControlledActorIds() {
  if (!canvas?.tokens) {
    return new Set();
  }

  return new Set(
    canvas.tokens.controlled.map((token) => token.actor?.id).filter(Boolean),
  );
}

// =====================================================
// SYNC TOKEN SELECTION
// =====================================================

export function syncTokenSelection(actors) {
  if (!canvas?.tokens) {
    return;
  }

  const selectedActorIds = new Set(
    actors.map((actor) => actor?.id).filter(Boolean),
  );

  const controlledTokens = [...canvas.tokens.controlled];

  // ---------------------------------------------------
  // RELEASE TOKENS THAT ARE NO LONGER SELECTED
  // ---------------------------------------------------

  for (const token of controlledTokens) {
    const actorId = token.actor?.id;

    if (!selectedActorIds.has(actorId)) {
      token.release();
    }
  }

  // ---------------------------------------------------
  // CONTROL TOKENS THAT SHOULD BE SELECTED
  // ---------------------------------------------------

  for (const actor of actors) {
    const token = getTokenForActor(actor);

    if (!token) {
      continue;
    }

    if (!token.controlled) {
      token.control({
        releaseOthers: false,
      });
    }
  }
}

// =====================================================
// CONTROL SINGLE ACTOR
// =====================================================

export function controlTokenForActor(actor) {
  if (!actor) {
    return null;
  }

  syncTokenSelection([actor]);

  return getTokenForActor(actor);
}
