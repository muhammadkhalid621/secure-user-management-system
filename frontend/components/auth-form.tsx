"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants";
import { appToast } from "@/lib/toast";
import {
  hasValidationErrors,
  setFieldError,
  validateAuthFields,
  validateEmail,
  validatePassword,
  validateRequired,
  type AuthField,
  type FieldErrors
} from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
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
  const [errors, setErrors] = useState<FieldErrors<AuthField>>({});

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

              const nextErrors = validateAuthFields(mode, { name, email, password });

              setErrors(nextErrors);

              if (hasValidationErrors(nextErrors)) {
                return;
              }

              const action = isRegister
                ? register({ name, email, password })
                : login({ email, password });

              const result = await dispatch(action);

              if (result.meta.requestStatus === "fulfilled") {
                appToast.success(
                  isRegister ? "Account created successfully." : "Signed in successfully."
                );
                router.replace(APP_ROUTES.DASHBOARD);
              } else {
                appToast.error(
                  typeof result.payload === "string"
                    ? result.payload
                    : isRegister
                      ? "Registration failed."
                      : "Login failed."
                );
              }
            }}
          >
            {isRegister ? (
              <FormField label="Full name">
                <Input
                  placeholder="Full name"
                  value={name}
                  onBlur={() =>
                    setErrors((current) =>
                      setFieldError(current, "name", validateRequired(name, "Full name", 2))
                    )
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setName(value);

                    if (errors.name) {
                      setErrors((current) =>
                        setFieldError(current, "name", validateRequired(value, "Full name", 2))
                      );
                    }
                  }}
                />
                <FieldError message={errors.name} />
              </FormField>
            ) : null}
            <FormField label="Email address">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onBlur={() =>
                  setErrors((current) => setFieldError(current, "email", validateEmail(email)))
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setEmail(value);

                  if (errors.email) {
                    setErrors((current) => setFieldError(current, "email", validateEmail(value)));
                  }
                }}
              />
              <FieldError message={errors.email} />
            </FormField>
            <FormField label="Password">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onBlur={() =>
                  setErrors((current) =>
                    setFieldError(current, "password", validatePassword(password))
                  )
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setPassword(value);

                  if (errors.password) {
                    setErrors((current) =>
                      setFieldError(current, "password", validatePassword(value))
                    );
                  }
                }}
              />
              <FieldError message={errors.password} />
            </FormField>
            <FormError message={authState.error} />
            <Button className="w-full" type="submit" disabled={authState.status === "loading"}>
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
