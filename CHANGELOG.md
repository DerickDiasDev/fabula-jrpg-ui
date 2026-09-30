# Changelog

All notable changes to Fabula JRPG UI will be documented in this file.

## [Unreleased]

### Added

- Persistent Party HUD outside of active Combat.
- New theme-based Party Renderer architecture.
- Wizardry-inspired Party HUD.
- Party character selection and multi-selection.
- Double-click interaction for opening character sheets.
- Support for party members that are not currently represented by a Canvas Token through a temporary combat-token workaround.
- Automatic synchronization between Party HUD members and Combatants.
- Automatic cleanup of temporary combat tokens when Combat ends.
- Wizardry theme is now available as the default theme.

### Changed

- Player HUD lifecycle is now independent from Combat.
- Party UI now persists outside of active Combat, while the Command HUD remains contextual to Combat.
- Party members are now managed independently from Combatants.
- HUD layout is recalculated correctly when the Command HUD becomes visible.
- Party HUD now displays only active Combatants while Combat is active.
- Party selection can now be used to add characters to the Project FU Combat flow.

### Technical

- Introduced theme-specific Party Renderers.
- Added a temporary combat-token workaround for characters that are not represented by a Canvas Token.
- Wizardry currently reuses the existing Octopath Command, Action, Target and Confirmation interfaces while their dedicated implementations are being developed.

## [1.0.1] - 2026-09-16

### Fixed

- Combat HUD now initializes correctly for other players when combat starts.
- Mouse navigation now supports returning to the previous submenu through the back arrow.
- The `F` hotkey no longer interferes with text inputs and other interactive Foundry UI elements.
- Added mouse interaction for switching between Party and Enemies in the target selection menu.
- The target group navigation arrows now use the same transition and interaction behavior as the keyboard controls.

## [1.0.0] - 2026-09-15

### Added

- JRPG-style combat command menu.
- Attack, Skill, Item, Study, Guard, Equipment, Hinder and Objective actions.
- Weapon and skill selection.
- Manual target count selection.
- Party and enemy target selection.
- Multi-target selection.
- Visual target cursor on the Foundry canvas.
- Active combatant highlighting.
- Party HUD with character portraits.
- HP, MP and IP display.
- Active status effect display.
- KO state visualization.
- UI navigation and interaction sounds.
- Configurable UI sound volume.
- Customizable HUD scale and position.
- Keyboard and mouse navigation.
- Multiplayer-compatible combat HUD.
