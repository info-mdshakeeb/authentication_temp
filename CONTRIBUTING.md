# Contributing Guide

First off, thanks for taking the time to contribute! Every improvement helps this template become more useful for the community.

## Getting Started

1. Fork the repository or click **Use this template** to start from a clean copy.
2. Clone your fork and install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env.local` and fill in the required values.
4. Run the dev server to ensure everything works:
   ```bash
   pnpm dev
   ```

## Branching Strategy

- Create a new branch for each contribution (e.g. `feat/auth-provider` or `fix/navbar-alignment`).
- Target pull requests against the `main` branch unless otherwise noted in an issue.

## Commit Messages

- Keep commits small and focused.
- Follow the conventional style when possible (e.g. `feat: add password reset page`).

## Running Checks

Before opening a pull request, make sure:

```bash
pnpm lint
pnpm test # (once tests are added)
pnpm build
```

## Pull Requests

- Fill in the Pull Request template completely.
- Link related issues in the PR description (e.g. `Closes #42`).
- Make sure CI is green before requesting review.

## Reporting Issues

- Search existing issues before opening a new one.
- Provide as much detail as possible: reproduction steps, screenshots, logs, and environment info.

## Questions and Discussions

For general questions or ideas, open a “feature request” issue or start a GitHub Discussion if enabled.

## Code of Conduct

By participating in this project you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md). Thank you for helping us keep the community welcoming!
