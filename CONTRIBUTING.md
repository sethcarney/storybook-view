# Contributing to Storybook View

Thank you for your interest in contributing!

## Prerequisites

- [Bun](https://bun.sh/) >=1.0.0
- [Visual Studio Code](https://code.visualstudio.com/) >=1.74.0
- Git

## Setup

```bash
git clone https://github.com/sethcarney/storybook-view.git
cd storybook-view
bun install
bun run setup        # installs test-app dependencies
bun run compile      # compile TypeScript
```

## Development Workflow

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `bun run compile` to verify TypeScript compiles cleanly
4. Run `bun run lint` to check for lint errors
5. Test manually via the Extension Development Host (`F5` in VSCode)
6. Open a component file from `test-apps/test-app-react/src/components/` and click the eye icon
7. Submit a pull request

## Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes
- `chore/description` — maintenance tasks

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for Vue 3
fix: resolve port detection issue on Windows
docs: update contributing guidelines
chore: bump dependencies
```

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Update `CHANGELOG.md` for user-visible changes
- Ensure CI passes before requesting review
- For significant changes, open an issue first to discuss the approach

## Code Style

- TypeScript with strict mode enabled
- ESLint: `bun run lint`
- Prettier: `.prettierrc` — formatting is enforced by lint

## Project Architecture

See [CLAUDE.md](CLAUDE.md) for a detailed overview of the codebase architecture, extension flow, and key components.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).
