<div align="center">

# Santiago Delgado — Portfolio

IT support & systems work, presented like a product instead of a résumé.

**[santi-portafolio.vercel.app](https://santi-portafolio.vercel.app)** · [LinkedIn](https://linkedin.com/in/santiagodelgado23) · [Email](mailto:santiagodelgadosanchez9@gmail.com)

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

## What's inside

- **Projects** — what's live (a full-stack learning platform, an online store, a VLAN troubleshooting lab) and the IT labs I'm building next.
- **Contact** — one short note with links to LinkedIn, GitHub, Instagram and email, plus the current time in Toronto and when I'm likely to reply.
- **Starfield background** — drawn on a single `<canvas>`, so it scales to thousands of stars without extra DOM nodes.
- **Light & dark themes** — remembered between visits.
- **Accessible motion** — animations with Framer Motion that respect `prefers-reduced-motion`.

## Run it locally

Requires Node.js 18+.

```bash
git clone https://github.com/Santi2307/santi-portafolio.git
cd santi-portafolio
npm install
npm run dev        # http://localhost:5173
```

`npm run build` creates the production bundle and `npm run preview` serves it.

## Structure

```
src/
├── pages/        Home and 404
├── components/   Hero, About, Skills, Projects, Contact, Navbar, Footer, UI primitives
├── hooks/        Active section, scroll direction, toasts
├── lib/          Shared utilities
└── store.js      Zustand store for the photo gallery
server/           Optional WebSocket server for a live visitor count (experiment)
```

---

<sub>Built and maintained by Santiago Delgado. </sub>
