# lego-water-flow

An interactive, browser-based water-flow playground that lets you snap together **LEGO-style hydraulic components** - pipes, junctions, tanks, pumps, weirs, and outfalls - and watch water flow through the resulting network in real time.

The goal is to make stormwater and drainage-system concepts (SWMM-style network hydraulics) tangible and tinker-friendly, without requiring an engineering license or a desktop hydraulic modeler.

## What it is

- A **single-page React + TypeScript** application built with Vite and styled with Tailwind + shadcn/ui.
- A drag-and-drop **piece inventory** of modular hydraulic "bricks" you can place on a board to build a network.
- A lightweight **flow simulator** that animates water moving from sources to outfalls based on the topology you build.
- An **Auto-Test results panel** that exercises the simulator against known scenarios so you can verify behavior after changes.

## Features

- Click-and-place hydraulic components on a grid.
- Connect pieces to form a flow network (source -> pipes/junctions -> outfall).
- Visualize flow direction, magnitude, and ponding.
- Parts-inventory checklist to track which pieces are in use.
- Auto-Test panel for regression / sanity checks on the simulation engine.
- Responsive UI with shadcn/ui components, accessible by keyboard.

## Tech stack

| Layer | Tool |
|---|---|
| Language | TypeScript |
| Framework | React 18 |
| Bundler / dev server | Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Package manager / runtime | Bun (`bun.lock` / `bun.lockb`) - also works with npm/pnpm |
| Testing | Vitest (`vitest.config.ts`) |
| Lint | ESLint (`eslint.config.js`) |
| Scaffolded by | [Lovable](https://lovable.dev) (`vite_react_shadcn_ts` template) |

## Project structure

```
lego-water-flow/
  public/              # Static assets served as-is
  src/
    assets/            # Images and static media used by components
    components/        # Reusable UI building blocks and hydraulic "bricks"
    hooks/             # Custom React hooks (state, simulation timing, etc.)
    lib/               # Simulation logic and helpers
    pages/
      Index.tsx        # Main app page (board + inventory + sim)
      NotFound.tsx     # 404 route
    test/              # Vitest unit / integration tests
    App.tsx            # Root component
    App.css
    index.css
    main.tsx           # Vite entry point
  index.html
  components.json      # shadcn/ui configuration
  tailwind.config.ts
  vite.config.ts
  vitest.config.ts
  tsconfig.json / tsconfig.node.json
  eslint.config.js
  package.json
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (preferred) **or** Node.js 18+ with npm/pnpm.

### Install

```bash
# with Bun
bun install

# or with npm
npm install
```

### Run the dev server

```bash
bun dev
# or
npm run dev
```

Open the URL printed in the terminal (typically http://localhost:5173).

### Run tests

```bash
bun test
# or
npm test
```

The **Auto-Test results panel** inside the app surfaces the same scenario checks at runtime.

### Build for production

```bash
bun run build
# or
npm run build
```

The production-ready bundle is emitted to `dist/`.

### Lint

```bash
bun run lint
# or
npm run lint
```

## How to use the app

1. Open the app in your browser.
2. Pick a piece from the **inventory** panel (pipes, junctions, tanks, pumps, weirs, outfalls).
3. Click on the board to place it; rotate / connect adjacent pieces.
4. Press the **Run** control to start the flow simulation.
5. Watch water animate from the source(s) to the outfall(s). Use the **Auto-Test** panel to validate that flow conservation, direction, and ponding behave as expected.

## Editing in Lovable

This project was scaffolded with [Lovable](https://lovable.dev). You can continue editing it visually there, or work locally in your editor of choice - changes pushed to `main` will round-trip with the Lovable workspace.

## Roadmap ideas

- More piece types (orifice, gate, storage with curve).
- Export the assembled network as SWMM5 `.inp`.
- Import an existing `.inp` and render it as LEGO pieces.
- Sharable URLs that encode a network in the query string.
- Mobile-friendly drag interactions.

## Contributing

1. Fork and create a feature branch.
2. Add a test (in `src/test/`) for any new simulator behavior.
3. Run `bun run lint` and `bun test` before opening a PR.
4. Keep components small and typed - prefer composing existing shadcn/ui primitives.

## License

No explicit license has been declared yet. Until one is added, all rights are reserved by the author. If you'd like to use this in another project, please open an issue.

## Maintainer

Maintained by [@dickinsonre](https://github.com/dickinsonre) under the **SWMMEnablement** organization, with assistance from the Lovable platform.
