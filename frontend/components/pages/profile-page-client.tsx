"use client";

import { useEffect, useState } from "react";
import { PERMISSIONS } from "@/lib/constants";
import { submitEntity } from "@/lib/client-crud";
import { appToast } from "@/lib/toast";
import type { RoleSummary } from "@/lib/types";
import {
  hasValidationErrors,
  setFieldError,
  validateProfileFields,
  validateRequired,
  validateEmail,
  type FieldErrors,
  type ProfileField
} from "@/lib/validation";
import { usePermission } from "@/hooks/use-permission";
import { bootstrapSession } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldError, FormError, FormSuccess } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfilePageClient = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const canUpdateProfile = usePermission(PERMISSIONS.USERS_UPDATE);
  const [form, setForm] = useState({ name: "", email: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProfileField>>({});

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
    }
  }, [user]);

  if (!user && authStatus === "loading") {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Profile unavailable"
        description="Your session could not be restored. Sign in again to access profile details."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="bg-slate-950 text-white">
        <CardContent className="p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Profile</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {user.name}
          </h1>
          <p className="mt-2 text-sm text-white/70">{user.email}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {user.roles.map((role: RoleSummary) => (
              <Badge key={role.id} className="bg-white/15 text-white">
                {role.slug}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Update profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canUpdateProfile ? (
              <EmptyState
                title="Profile editing unavailable"
                description="Your current permission set allows viewing this profile but not changing it."
              />
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setFormError(null);
                  setFormSuccess(null);

                  const nextErrors = validateProfileFields(form);
                  setFieldErrors(nextErrors);

                  if (hasValidationErrors(nextErrors)) {
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    await submitEntity({
                      path: `/api/users/${user.id}`,
                      method: "PUT",
                      payload: {
                        name: form.name,
                        email: form.email
                      }
                    });
                    await dispatch(bootstrapSession());
                    setFormSuccess("Profile updated successfully.");
                    appToast.success("Profile updated successfully.");
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "Profile update failed.";
                    setFormError(message);
                    appToast.error(message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <FormField label="Full name">
                  <Input
                    placeholder="Full name"
                    value={form.name}
                    onBlur={() =>
                      setFieldErrors((current) =>
                        setFieldError(current, "name", validateRequired(form.name, "Full name", 2))
                      )
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({ ...current, name: value }));

                      if (fieldErrors.name) {
                        setFieldErrors((current) =>
                          setFieldError(current, "name", validateRequired(value, "Full name", 2))
                        );
                      }
                    }}
                  />
                  <FieldError message={fieldErrors.name} />
                </FormField>
                <FormField label="Email address">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onBlur={() =>
                      setFieldErrors((current) =>
                        setFieldError(current, "email", validateEmail(form.email))
                      )
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({ ...current, email: value }));

                      if (fieldErrors.email) {
                        setFieldErrors((current) =>
                          setFieldError(current, "email", validateEmail(value))
                        );
                      }
                    }}
                  />
                  <FieldError message={fieldErrors.email} />
                </FormField>
                <FormSuccess message={formSuccess} />
                <FormError message={formError} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving profile..." : "Save profile"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assigned Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Roles</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.roles.map((role: RoleSummary) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Permissions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.permissions.map((permission: string) => (
                  <Badge key={permission} variant="muted">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
