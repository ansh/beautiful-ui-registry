# Beautiful UI — shadcn registry

A [shadcn](https://ui.shadcn.com) registry for [Beautiful UI](https://www.beautifului.dev), the AI-native interface primitives by [Shane Levine](https://www.shanelevine.com) / [Turbo](https://turbodesign.co).

Beautiful UI publishes its components as MIT-licensed copy-paste primitives but doesn't ship a registry, so there's no way to install one from the command line. This adds that layer.

```bash
npx shadcn@latest add https://beautiful-ui.chorus.host/r/thinking-state.json
```

## Components

| Item | Install |
| --- | --- |
| `theme` | `npx shadcn@latest add https://beautiful-ui.chorus.host/r/theme.json` |
| `loading-state` | `… /r/loading-state.json` |
| `thinking-state` | `… /r/thinking-state.json` |
| `streaming-text` | `… /r/streaming-text.json` |
| `tool-chips` | `… /r/tool-chips.json` |
| `approval-card` | `… /r/approval-card.json` |
| `task-rows` | `… /r/task-rows.json` |
| `chat-composer` | `… /r/chat-composer.json` |
| `prompt-bar` | `… /r/prompt-bar.json` |
| `code-block` | `… /r/code-block.json` |

Every component item pulls `theme` as a registry dependency, so installing one component brings the tokens with it.

## The theme

`theme` installs `styles/beautiful-ui.css` — the token layer the components are written against. Import it after Tailwind:

```css
@import "tailwindcss";
@import "./styles/beautiful-ui.css";
```

It defines the vocabulary the class names use, which is what makes the components portable:

- **Surfaces**, back to front — `page`, `canvas`, `surface`, `inset`, `hover`, `hover-2`, `field`
- **Ink ramp** — `ink`, `ink-2`, `ink-3`
- **Hairlines** — `line`, `line-strong`, `line-soft`
- **Semantic** — `bui-accent`, `green`, `orange`, `red`, each with a `-tint`
- **Radii** — `chip` 6px, `control` 8px, `card` 10px, `window` 14px
- **Elevation** — `shadow-hairline`, `shadow-btn`, `shadow-card`, `shadow-raised`, `shadow-overlay`, each a 1px ring plus a layered drop shadow rather than a border
- **Easing** — `--ease-out-strong` `cubic-bezier(0.23, 1, 0.32, 1)` on nearly every transition

Light and dark are both defined; dark activates under `.dark`.

### Coexisting with a shadcn theme

`accent` is the one token name that collides with a stock shadcn theme, where it
means a muted hover surface rather than the primary action colour. Ours is
namespaced `bui-accent` / `bui-accent-ink` / `bui-accent-tint` so both can live in
the same app — otherwise whichever stylesheet loaded second wins and the other
system's accent utilities resolve to an invalid colour, silently. Every other
Beautiful UI token name is already unique.

For the same reason the theme does not claim `--font-sans` or `--font-mono`;
components inherit the host app's typography. The `prefers-reduced-motion` rule is
scoped to this library's own keyframes rather than matching `*`.

## Requirements

- Tailwind CSS **v4** (the theme uses `@theme` and `@utility`)
- React 18 or 19
- `clsx` and `tailwind-merge`, via the standard shadcn `cn` helper at `@/lib/utils`

Components are unstyled beyond the token layer and take a `className`, so restyling means overriding tokens rather than patching components.

## Provenance

The token layer is transcribed exactly from the stylesheet published at beautifului.dev — the OKLCH values, radii, easings and shadow stacks are the originals.

The components are **reconstructions**, not the original source. beautifului.dev ships no repository and no source maps, so these were rebuilt from the server-rendered markup and the class strings in the client bundle. Layout, class names, timings and easing curves match what the site ships; the behaviour behind them was rewritten.

Ten of the twenty primitives on the site are covered here. The remaining ten — Recommendation Card, Context Cards, Diff Table, Records Table, Filter Table, Sidebar Nav, Search, Flowchart, Insight Cards, Fine-tune Card, Selection Actions — are heavier on interaction logic and aren't worth reconstructing blind.

**If you're Shane:** this is yours to take. Drop your real sources into `registry/beautiful-ui/ui/`, add entries to `registry.json`, run `node scripts/build-registry.mjs`, and serve `public/r/` from beautifului.dev. Then the install command becomes `npx shadcn@latest add https://www.beautifului.dev/r/thinking-state.json` and this repo can go away.

## Building

```bash
node scripts/build-registry.mjs                     # -> public/r/*.json
BASE_URL=https://www.beautifului.dev node scripts/build-registry.mjs
```

`BASE_URL` rewrites the absolute URLs in each item's `registryDependencies`, which have to be absolute for a registry that isn't ui.shadcn.com.

## License

MIT © 2026 Shane Levine. Same license the components are published under; the notice travels with the code.
