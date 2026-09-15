const AUDIO_PATH = "modules/fabula-jrpg-ui/assets/audio";

const sounds = {
  navigate: `${AUDIO_PATH}/ui-navigate.ogg`,
  swipe: `${AUDIO_PATH}/ui-swipe.ogg`,
  confirm: `${AUDIO_PATH}/ui-confirm.ogg`,
  cancel: `${AUDIO_PATH}/ui-cancel.ogg`,
};

export function playUISound(type) {
  const src = sounds[type];

  if (!src) {
    console.warn(`Fabula JRPG UI | Som não encontrado: ${type}`);
    return;
  }

  foundry.audio.AudioHelper.play(
    {
      src,
      volume: 0.8,
      loop: false,
    },
    false,
  );
}
