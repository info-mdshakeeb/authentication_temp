# Next Temp · Next.js Authentication Template

Kickstart a production-ready authentication experience with [Next.js](https://nextjs.org), TypeScript, and Tailwind CSS. This repository doubles as a **GitHub template**, giving you a clean starting point for secure, modern web apps.

---

## 🚀 Quick start

1. **Create your project**

   - On GitHub, click **Use this template → Create a new repository**.
   - Or scaffold locally with degit:
     ```bash
     npx degit info-mdshakeeb/next_temp my-app
     cd my-app
     git init && git add . && git commit -m "chore: bootstrap from template"
     ```

2. **Install dependencies**

   ```bash
   pnpm install
   # npm install | yarn install also work, but pnpm is recommended
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Generate a fresh `AUTH_SECRET` (e.g. `openssl rand -base64 32`) and fill in any other variables you enable.

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the starter.

5. **Ship it**
   ```bash
   pnpm build
   pnpm start
   ```

---

## ✨ Features

- ⚡️ Next.js 15 (App Router, Server Components)
- 🛡️ Strict TypeScript everywhere
- 🎨 Tailwind CSS with PostCSS 4
- 🔐 Ready for custom auth flows with `@t3-oss/env-nextjs`
- 🧰 ESLint 9 + Prettier-friendly config
- ♻️ Changesets-powered release workflow
- 🤖 Automated dependency updates via Dependabot

---

## 🧱 Project structure

```
src/
  app/         # Routes, layouts, and UI
  components/  # Shared UI primitives
  hooks/       # Reusable hooks
  env.js       # Runtime-safe environment management
public/        # Static assets
.github/       # CI, templates, Dependabot
.changeset/    # Release notes + version strategy
```

---

## 🔧 Available scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Run Next.js in development with Turbopack  |
| `pnpm build`     | Create an optimized production build       |
| `pnpm start`     | Serve the production build                 |
| `pnpm lint`      | Run ESLint across the project              |
| `pnpm changeset` | Record a changeset entry for releases      |
| `pnpm release`   | Apply pending changesets and bump versions |

---

## 🔐 Environment variables

All required values live in [`src/env.js`](./src/env.js) and are validated with Zod.

| Variable      | Required  | Description                         |
| ------------- | --------- | ----------------------------------- |
| `AUTH_SECRET` | ✅ (prod) | Secret used by auth/session tooling |
| `NODE_ENV`    | auto      | Managed by Next.js                  |

Add client-safe variables with the `NEXT_PUBLIC_` prefix and map them in `env.js`.

---

## 🧪 Quality gates

GitHub Actions runs `pnpm lint` on every push and pull request. Extend the workflow with `pnpm test` and `pnpm build` as your project evolves.

Locally, run:

```bash
pnpm lint
pnpm test   # when tests are added
pnpm build
```

---

## 📦 Release workflow

1. Create a branch for your change.
2. Run `pnpm changeset` and follow the prompts to note the update.
3. Commit your code + the generated `.changeset/*.md` file.
4. When changes land on `main`, run `pnpm release` to bump versions and update the changelog.
5. Tag the release (`git tag vX.Y.Z && git push origin vX.Y.Z`) and publish on GitHub.

---

## 🤝 Contributing

- Read the [Contributing Guide](./CONTRIBUTING.md) for branching, commits, and testing expectations.
- Review the [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a welcoming community.
- Open issues using the provided templates:
  - [Bug report](./.github/ISSUE_TEMPLATE/bug_report.md)
  - [Feature request](./.github/ISSUE_TEMPLATE/feature_request.md)

Pull requests should target `main` and must pass CI.

---

## 👨‍💻 Maintainer

Created and maintained by **Shakeeb**. Questions or suggestions? Open an issue at [info-mdshakeeb/next_temp/issues](https://github.com/info-mdshakeeb/next_temp/issues).

---

## 📄 License

Released under the [MIT License](./LICENSE). Have fun and build something great!
