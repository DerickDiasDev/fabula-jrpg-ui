export function createPartyMember(actor, token = null) {
  if (!actor) {
    return null;
  }

  return {
    actor,
    token,
  };
}
