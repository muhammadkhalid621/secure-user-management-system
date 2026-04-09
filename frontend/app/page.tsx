const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export default function Home() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Level 1 Setup</p>
        <h1>Mini Secure User Management</h1>
        <p className="copy">
          Frontend and backend foundations are in place. Feature implementation
          for authentication, user management, notifications, logging, and rate
          limiting will be added in the next levels.
        </p>
        <div className="meta">
          <span>Frontend: Next.js</span>
          <span>Backend API: {apiBaseUrl}</span>
        </div>
      </section>
    </main>
  );
}

