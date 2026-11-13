# Changelog

All notable changes to Fabula JRPG UI will be documented in this file.

## [Unreleased]

### Added

- GM-only NPC Command. When the Command actor is an NPC, the menu switches to NPC commands (Attack, Spell, Skill, Guard, Hinder), following the Combat tab of the Project FU NPC sheet.
  - Attack lists the NPC's basic attacks, plus its weapons when the NPC uses equipment.
  - Skill lists skills and misc abilities.
- The GM can open the NPC Command by selecting an NPC token, including outside of that NPC's turn.
- Random target selection for the NPC Command: a Random button (or the `R` key) in Target Select picks the chosen number of targets from the open group, without repetition, and goes straight to Confirm.
- Turn indicator on Party cards during Combat: an orange circle with a white border, filled while the character still has a turn in the current round and empty once it has acted. It reads the turns taken by Project FU.
- Client-side button to minimize the Party cards; the choice is remembered per user.

### Changed

- Players no longer see the Command while its actor is an NPC. Selecting their own character brings it back.
- KO combatants can no longer be targeted, in both the Party and Enemies groups.
- Targets are sorted by name in natural order ("Skeleton 2" before "Skeleton 10").
- The Command HUD only appears after Combat has started; an encounter that was created but not started no longer shows it.
- The Wizardry Party shows 2 cards per row when there are 4 members.

### Fixed

- The Command menu frame now fits menus with any number of commands.
- Command execution is blocked for users who are neither GM nor owner of the actor.
- Actor, item and effect names and images are escaped in all HUD templates.
- The HUD refreshes when combats or combatants are created or deleted, and when the scene changes.
- Party cards keep their selection and visual states between turns; the Party is only re-rendered when its member list changes.
- Party card names and portraits update when the actor changes.
- The active-turn highlight is cleared when Combat ends.
- Active-turn and card target highlights now work in the Wizardry theme.
- Switching characters closes the whole submenu flow, including Wizardry cards without tokens.
- Wizardry drag selection now starts correctly.
- The HUD always returns to the Command after an action is executed.

### Technical

- Commands are identified by a `data-command` id instead of the button text, and the Command menu uses event delegation so its command set can be swapped.
- Party cards are located through a theme-agnostic contract (`data-fui-party-card` / `getPartyCard`).
- Party interactions use event delegation and are set up once.
- HUD customization was migrated to ApplicationV2.
- Companions (NPCs with the `companion` rank) don't use the NPC Command yet; companion support is planned.

## [1.1.0-beta.1] - 2026-09-30

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
