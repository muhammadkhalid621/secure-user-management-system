import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    title: "Role-aware control",
    description: "Dynamic roles and permissions synced with the secure backend."
  },
  {
    title: "Realtime activity",
    description: "Login and user mutations surface instantly through live notifications."
  },
  {
    title: "Operational visibility",
    description: "Audit logs, rate limiting, and guarded routes are built in from day one."
  }
];

export default function HomePage() {
  return (
    <main className="container flex min-h-screen items-center py-10">
      <section className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Secure User Management Console
          </div>
          <div className="space-y-5">
            <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Operate users, roles, and audit trails from one focused control room.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              A production-style admin dashboard on top of the secured backend,
              with protected navigation, permission-aware UI, and live system signals.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
          <div className="surface-grid">
            <Card className="glass-panel border-amber-200/50 bg-amber-50/80">
              <CardContent className="p-5">
                <Users className="h-6 w-6 text-amber-600" />
                <p className="mt-4 text-sm font-medium text-slate-900">Users and Roles</p>
                <p className="mt-1 text-sm text-slate-600">Manage team access with explicit permission mapping.</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-teal-200/50 bg-teal-50/80">
              <CardContent className="p-5">
                <Sparkles className="h-6 w-6 text-teal-700" />
                <p className="mt-4 text-sm font-medium text-slate-900">Live Notifications</p>
                <p className="mt-1 text-sm text-slate-600">Track important auth and CRUD events as they happen.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="glass-panel relative overflow-hidden p-8">
          <div className="absolute right-0 top-0 h-40 w-40 animate-float rounded-full bg-teal-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="relative space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              What is included
            </p>
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-3xl border border-slate-200/70 bg-white/90 p-5"
              >
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                  {highlight.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
