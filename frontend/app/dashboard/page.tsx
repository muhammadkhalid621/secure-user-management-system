import { Activity, Shield, Users } from "lucide-react";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  {
    title: "Access Control",
    description: "Permissions are enforced end-to-end, from UI visibility to backend authorization.",
    icon: Shield
  },
  {
    title: "User Lifecycle",
    description: "Manage account creation, profile edits, and removals from one place.",
    icon: Users
  },
  {
    title: "Operational Trace",
    description: "Audit records and live events make auth and admin activity easy to follow.",
    icon: Activity
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Command Center</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">
              Secure operations with a cleaner admin workflow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              This dashboard is connected to the protected API layer, role-aware UI,
              and realtime notifications pipeline.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-white/80">System posture</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">JWT access + refresh tokens</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">Redis-backed rate limiting and cache</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">Bull queue and WebSocket notifications</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4 text-lg">{metric.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-600">{metric.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <RealtimeNotifications />
      </div>
    </div>
  );
}
