# TeachMatch KZ

A modern, responsive React + TypeScript web platform that helps international and public schools across Kazakhstan (and wider Asia) hire CELTA-qualified English teachers. The app supports premium job listings, teacher profiles, and an upcoming AI-powered matching service.

## Tech Stack

- Vite
- React 19 + TypeScript
- Tailwind CSS 4
- React Router 6
- ESLint (with React rules)

## Getting Started

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

The app will be available at http://localhost:5173.

## Project Structure

```
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── assets/           # Logo & other media
│   ├── components/       # Re-usable UI pieces (Navbar, Footer…)
│   ├── pages/            # Route-level components
│   ├── pages/legal/      # Terms & Privacy
│   ├── routes.tsx        # Central route map
│   ├── App.tsx           # App shell
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind directives
└── ...
```

## Customisation

1. Replace `public/favicon.png` and `src/assets/logo.svg` with your production-ready graphics.
2. Update colours or fonts in `tailwind.config.ts` as desired.
3. Flesh out each page & component. The current implementation is a functional skeleton to get you moving fast.

## Deploying

The project is framework-agnostic. Any static host that can serve the `build` output folder will work (Netlify, Vercel, GitHub Pages, etc.).

```bash
npm run build
```

## Authentication Troubleshooting

If you experience registration or login issues (JWT malformed errors, session timeouts):

### Quick Fix
```bash
# 1. Setup local environment
node setup-auth.js

# 2. Debug authentication issues
node debug-auth.js
```

### Common Issues

**Registration fails with session timeout:**
- Missing `JWT_SECRET` environment variable
- Add to Vercel: Settings → Environment Variables → `JWT_SECRET` (32+ chars)
- Redeploy after adding variables

**"JWT malformed" errors:**
- Clear browser storage: `localStorage.clear()`
- Ensure JWT_SECRET is properly configured in production

**400 errors during registration:**
- Check all required fields are filled
- Verify email format and password length (8+ chars)

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

Made with ❤️ to empower educators.
