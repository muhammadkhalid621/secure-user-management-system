"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, register } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const AuthForm = ({ mode }: { mode: "login" | "register" }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authState = useAppSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  return (
    <main className="container flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>{isRegister ? "Create your workspace access" : "Welcome back"}</CardTitle>
          <CardDescription>
            {isRegister
              ? "Register and land directly inside the protected admin console."
              : "Use your account to access the secure dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();

              const action = isRegister
                ? register({ name, email, password })
                : login({ email, password });

              const result = await dispatch(action);

              if (result.meta.requestStatus === "fulfilled") {
                router.replace(APP_ROUTES.DASHBOARD);
              }
            }}
          >
            {isRegister ? (
              <Input
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            ) : null}
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {authState.error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {authState.error}
              </p>
            ) : null}
            <Button className="w-full" type="submit">
              {authState.status === "loading"
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-slate-500">
            {isRegister ? "Already registered?" : "Need an account?"}{" "}
            <Link
              className="font-semibold text-primary hover:text-primary/80"
              href={isRegister ? APP_ROUTES.LOGIN : APP_ROUTES.REGISTER}
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};
