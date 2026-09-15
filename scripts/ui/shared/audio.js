const AUDIO_PATH = "modules/fabula-jrpg-ui/assets/audio";

const SETTINGS_NAMESPACE = "fabula-jrpg-ui";
const UI_SOUND_VOLUME_SETTING = "uiSoundVolume";

const DEFAULT_UI_SOUND_VOLUME = 0.8;

const UI_SOUNDS = {
  navigate: `${AUDIO_PATH}/ui-navigate.ogg`,
  swipe: `${AUDIO_PATH}/ui-swipe.ogg`,
  confirm: `${AUDIO_PATH}/ui-confirm.ogg`,
  cancel: `${AUDIO_PATH}/ui-cancel.ogg`,
};

export function registerAudioSettings() {
  game.settings.register(SETTINGS_NAMESPACE, UI_SOUND_VOLUME_SETTING, {
    name: "UI Sound Volume",
    hint: "Controls the volume of the Fabula JRPG UI sounds.",
    scope: "client",
    config: true,
    type: Number,
    default: DEFAULT_UI_SOUND_VOLUME,
    range: {
      min: 0,
      max: 1,
      step: 0.05,
    },
  });
}

export function playUISound(type) {
  const src = UI_SOUNDS[type];

  if (!src) {
    console.warn(`Fabula JRPG UI | Som não encontrado: ${type}`);
    return;
  }

  const volume = game.settings.get(SETTINGS_NAMESPACE, UI_SOUND_VOLUME_SETTING);

  foundry.audio.AudioHelper.play(
    {
      src,
      volume,
      loop: false,
    },
    false,
  );
}
