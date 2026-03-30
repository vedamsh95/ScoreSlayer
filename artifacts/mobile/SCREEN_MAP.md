# ScoreSlayer Screen Map

Meaningful screen names mapped to file paths (Expo Router preserves routing):

## Layouts
| Screen Name | File |
|-------------|------|
| Main App Layout | `app/_layout.tsx` |
| Tabs Layout | `app/(tabs)/_layout.tsx` |
| NotFoundScreen | `app/+not-found.tsx` |

## Tab Screens
| Screen Name | File |
|-------------|------|
| HomeScreen | `app/(tabs)/index.tsx` |
| HistoryScreen | `app/(tabs)/history.tsx` |

## Core Screens
| Screen Name | File |
|-------------|------|
| GameScreen | `app/game/[id].tsx` |
| SetupScreen | `app/setup/[gameId].tsx` |
| ResultsScreen | `app/results/[id].tsx` |
| GameToolsScreen | `app/tools/index.tsx` |

## Game Variant Screens
| Game | Index Screen | Detail Screen |
|------|--------------|---------------|
| Hearts | HeartsVariantsScreen (`hearts/index.tsx`) | HeartsVariantDetailScreen (`hearts/[variantId].tsx`) |
| Phase 10 | Phase10VariantsScreen (`phase10/index.tsx`) | Phase10VariantDetailScreen (`phase10/[variantId].tsx`) |
| Rummy | RummyVariantsScreen (`rummy/index.tsx`) | RummyVariantDetailScreen (`rummy/[variantId].tsx`) |
| Spades | SpadesVariantsScreen (`spades/index.tsx`) | SpadesVariantDetailScreen (`spades/[variantId].tsx`) |
| Uno | UnoVariantsScreen (`uno/index.tsx`) | VariantDetailScreen (`uno/[variantId].tsx`) |

**Note**: Dynamic `[id].tsx` files cannot be renamed without breaking routes.

