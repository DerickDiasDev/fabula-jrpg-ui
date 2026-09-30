# Fabula JRPG UI

[![Version](https://img.shields.io/github/v/release/DerickDiasDev/fabula-jrpg-ui?label=Version)](https://github.com/DerickDiasDev/fabula-jrpg-ui/releases)

[![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v14-informational)](https://foundryvtt.com/)

[![Project FU](https://img.shields.io/badge/System-Project%20FU-informational)](https://github.com/League-of-Fabula/FoundryVTT-Fabula-Ultima)

[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[![Discord](https://img.shields.io/badge/Discord-derick.dias-5865F2?logo=discord&logoColor=white)](https://discord.com/users/225264620103794698)

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
- Persistent Party HUD outside of active Combat
- Theme-based Party HUD
- Wizardry-inspired Party HUD
- Party member selection and multi-selection
- Character sheet access through the Party HUD
- HP, MP and IP display
- Attribute display
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

The Party HUD is persistent and remains visible outside of active Combat.

The Command HUD is contextual to Combat and appears when Combat becomes active.

### Party HUD

The Party HUD displays the characters available to the current player.

Click a character to select them and make them the active character for the Command Menu.

Hold **Ctrl** (or **Cmd** on macOS) while clicking to select multiple characters.

Double-click a character to open their character sheet.

The Party HUD does not require every party member to have a Token currently placed on the Canvas.

### Starting Combat

The GM can select one or more party members and use the **Add to Combat** button to add them to the current Combat.

Characters that are not currently represented by a Canvas Token use a temporary combat-token workaround so they can participate in the normal Project FU combat flow.

These temporary tokens are automatically removed when Combat ends.

This is an integration workaround and does not mean that party members inherently require Canvas Tokens.

### During Combat

When Combat starts, the Party HUD automatically switches to displaying only the characters that are currently participating in Combat.

The Command HUD becomes available and can be used to perform the available actions.

Selecting a different party member changes the character controlled by the Command Menu.

The Party HUD automatically updates when relevant actor data changes, including resources, statuses and KO state.

### Ending Combat

When Combat ends, the Party HUD returns to displaying the available party members.

Temporary combat tokens created by Fabula JRPG UI are automatically removed.

## Keyboard and Mouse Controls

Press **F** to focus the Command Menu while Combat is active.

Keyboard navigation supports:

- `Arrow Up / Down` — Navigate menu options
- `Arrow Left / Right` — Switch between target groups
- `Enter` — Confirm
- `Escape` — Return to the previous menu

Mouse interaction is also supported.

## Themes

Fabula JRPG UI supports theme-specific HUD implementations.

The current themes are:

- **Wizardry** — The current default theme, inspired by Wizardry: Proving Grounds.
- **Octopath** — The original JRPG-inspired theme.

The Wizardry theme currently provides its own Party HUD implementation.

The Command, Action, Target and Confirmation interfaces currently reuse the existing Octopath implementation while dedicated Wizardry versions are being developed.

The theme can be changed through:

**Game Settings → Configure Settings → Module Settings → Fabula JRPG UI → HUD Theme**

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
