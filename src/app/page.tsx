import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero-card">
        <p className="eyebrow">Step 4 Complete Scaffold</p>
        <h1>Bird Stat Next.js App</h1>
        <p className="hero-copy">
          The project is now scaffolded with the Next.js App Router. This step gives us the runtime,
          routing, and deployment shape we need before wiring Supabase Auth and CRUD behavior.
        </p>
      </section>

      <section className="route-grid">
        <article className="route-card">
          <h2>Login</h2>
          <p>Reserved for Supabase email sign-in in Step 5.</p>
          <Link className="route-link" href="/login">
            Open /login
          </Link>
        </article>

        <article className="route-card">
          <h2>Dashboard</h2>
          <p>Will show date-grouped records once data queries are connected.</p>
          <Link className="route-link" href="/dashboard">
            Open /dashboard
          </Link>
        </article>

        <article className="route-card">
          <h2>New Entry</h2>
          <p>Will become the authenticated form for stock and photo uploads.</p>
          <Link className="route-link" href="/entries/new">
            Open /entries/new
          </Link>
        </article>
      </section>

      <ul className="checklist">
        <li>Next.js App Router installed</li>
        <li>TypeScript and ESLint configured</li>
        <li>Starter routes created for login, dashboard, and new entry</li>
        <li>Ready for Supabase client and auth wiring in the next step</li>
      </ul>
    </main>
  );
}
