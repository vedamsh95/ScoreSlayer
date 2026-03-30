# Unified Clay Table Redesign - GameScreen
Status: In Progress

## Plan Breakdown & Steps

### 1. ✅ Create TODO.md (done)
### 2. ✅ Redesign PlayerScoreRow.tsx → PlayerCell for table use
   - Compact vertical layout: rank dot, name+badges, total+progress bar, recent delta
   - Add progress prop (0-1) for vertical NeuTrench fill (player.color)
   - Backward compatible

### 3. ✅ Replace GameScreen.tsx sections
   - Remove PlayersSection, history toggle, separate history card
   - Add UnifiedClayTable PolymerCard w/ 3-col layout:
     | Fixed Player Details (PlayerCell) | Scrollable Rounds (history cells + badges) | Fixed Total (large score)
   - Header: PLAYER | R1..R{round-1} (BrandButton edit) | TOTAL

### 4. Test & Verify
   - Render: table shows players/history/totals correctly
   - Edit rounds: click Ri → ScoreInputModal w/ initial data
   - Sorting: Phase10 phases, totals
   - Game badges: Phase10✔️, Spades bid/won/bags, UNO🏆, logs
   - Responsive: horizontal scroll
   - Run `npx expo start --clear`

### 5. ✅ Completion
   - All steps done! Unified Clay table live w/ synchronized scroll, simplified player column (rank+name), 3-col design (Player | Rounds | Total).
   - Test: cd artifacts/mobile && npx expo start --clear

