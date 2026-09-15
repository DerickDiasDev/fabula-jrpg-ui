# Fabula JRPG UI

A JRPG-style combat interface for **Fabula Ultima**, built for the **Project FU** system on Foundry Virtual Tabletop.

Fabula JRPG UI provides an immersive combat HUD inspired by classic console JRPG battle interfaces.

## Features

- JRPG-style combat command menu
- Attack, Skill, Item, Study, Guard, Equipment, Hinder and Objective actions
- Weapon and skill selection
- Manual target count selection
- Party and enemy target selection
- Multi-target selection
- Visual target cursor on the Foundry canvas
- Active combatant highlighting
- Party HUD with character portraits
- HP, MP and IP display
- Active status effect display
- KO state visualization
- UI navigation and interaction sounds
- Configurable UI sound volume
- Customizable HUD scale and position
- Keyboard and mouse navigation
- Multiplayer-compatible combat HUD

## Requirements

- Foundry Virtual Tabletop v14
- Project FU

Fabula JRPG UI is designed specifically for the Project FU system.

## Installation

### From Foundry

Once the module is available in the Foundry package browser:

1. Open **Add-on Modules**.
2. Select **Install Module**.
3. Search for **Fabula JRPG UI**.
4. Install and enable the module in your world.

### Manual Installation

Download the latest release from the project's GitHub repository and extract the module into:

```text
FoundryVTT/Data/modules/fabula-jrpg-ui/
```

After installation, enable **Fabula JRPG UI** in your world's Add-on Modules.

## Usage

Start an active combat with at least one character combatant.

The Fabula JRPG UI will automatically appear when combat starts.

Press **F** to focus the command menu.

Keyboard navigation supports:

- `Arrow Up / Down` — Navigate menu options
- `Arrow Left / Right` — Switch between target groups
- `Enter` — Confirm
- `Escape` — Return to the previous menu

Mouse interaction is also supported.

## Configuration

Fabula JRPG UI provides client-side configuration options for:

### HUD

- Command menu scale
- Party HUD scale
- HUD positioning
- Reset HUD layout

### Audio

- UI sound volume

Configuration can be accessed through:

**Game Settings → Configure Settings → Module Settings → Fabula JRPG UI**

## Targeting

Fabula JRPG UI uses player-selected targeting rather than automatically determining valid targets.

This allows players to manually select targets when an action may interact with different types of targets depending on the situation.

Combatants are organized into:

- Party
- Enemies

Multiple targets can be selected when supported by the action.

## Compatibility

Currently developed and tested for:

- Foundry Virtual Tabletop v14
- Project FU

Other systems are not supported.

## Credits

Created by **Spell**.

Discord: **derick.dias**

Built for the Project FU system.

## License

Fabula JRPG UI is released under the **MIT License**.

See the [`LICENSE`](LICENSE) file for the complete license text.
