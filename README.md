# Authentication Temp

A modern, scalable authentication starter built with [Next.js](https://nextjs.org), TypeScript, and Tailwind CSS. This project provides a robust foundation for building secure, production-ready web applications

## Features

- ⚡️ Next.js 15 (App Router, Server Components)
- 🛡️ TypeScript strict mode for type safety
- 🎨 Tailwind CSS for rapid UI development
- 🔒 Ready for secure authentication flows
- 🧩 Modular, scalable project structure
- 🛠️ ESLint & Prettier for code quality
- 🌱 Environment variable management with Zod

## Tech Stack

- [Next.js](https://nextjs.org/) 15
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/) for schema validation
- [ESLint](https://eslint.org/) for linting

## Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

3. **Build for production:**

   ```bash
   pnpm build
   # or
   npm run build
   # or
   yarn build
   ```

## Project Structure

- `src/app/` — Main application code (pages, layouts, components)
- `public/` — Static assets
- `tsconfig.json` — TypeScript configuration
- `eslint.config.mjs` — ESLint configuration

## Contributing

We love community involvement! Here's the quickest way to get started:

1. Check the open [issues](https://github.com/info-mdshakeeb/authentication_temp/issues) or raise a new one describing the problem.
2. Create a feature branch from `dev` (`git checkout -b feature/my-change`).
3. Run the quality checks locally: `pnpm install` then `pnpm lint`.
4. Open a pull request and fill in the template. The CI checks (see below) must pass before merge.

## Continuous Integration

Every pull request triggers an automated lint check via GitHub Actions to keep the codebase healthy.

## Maintainer

This project is maintained by **Shakeeb**. Feel free to reach out via issues for questions or suggestions.

## License

This project is open source and available under the [MIT License](LICENSE).
