const AUDIO_PATH = "modules/fabula-jrpg-ui/assets/audio";

const UI_SOUNDS = {
  navigate: `${AUDIO_PATH}/ui-navigate.ogg`,
  swipe: `${AUDIO_PATH}/ui-swipe.ogg`,
  confirm: `${AUDIO_PATH}/ui-confirm.ogg`,
  cancel: `${AUDIO_PATH}/ui-cancel.ogg`,
};

const UI_SOUND_VOLUME = 0.8;

export function playUISound(type) {
  const src = UI_SOUNDS[type];

  if (!src) {
    console.warn(`Fabula JRPG UI | Som não encontrado: ${type}`);
    return;
  }

  foundry.audio.AudioHelper.play(
    {
      src,
      volume: UI_SOUND_VOLUME,
      loop: false,
    },
    false,
  );
}
