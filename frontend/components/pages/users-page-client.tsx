"use client";

import { useState } from "react";
import { Pencil, UserPlus } from "lucide-react";
import { loadCollection, submitEntity } from "@/lib/client-crud";
import { PERMISSIONS, QUERY_DEFAULTS } from "@/lib/constants";
import { appToast } from "@/lib/toast";
import type { Role, SafeUser } from "@/lib/types";
import {
  hasValidationErrors,
  setFieldError,
  validateEmail,
  validatePassword,
  validateRequired,
  validateUserFields,
  type FieldErrors,
  type UserField
} from "@/lib/validation";
import { usePermission } from "@/hooks/use-permission";
import { ActionGuard } from "@/components/guards/action-guard";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { useAsyncData } from "@/lib/query-hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { DeleteAction } from "@/components/ui/delete-action";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldError, FormError, FormSuccess } from "@/components/ui/form-error";
import { FiltersBar } from "@/components/ui/filters-bar";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageSectionHeader, SectionActionButton } from "@/components/ui/page-section-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";

const createInitialForm = () => ({
  name: "",
  email: "",
  password: "",
  roleIds: [] as string[]
});

export const UsersPageClient = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState<number>(QUERY_DEFAULTS.PAGE);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [form, setForm] = useState(createInitialForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<UserField>>({});
  const canCreate = usePermission(PERMISSIONS.USERS_CREATE);
  const canUpdate = usePermission(PERMISSIONS.USERS_UPDATE);
  const canDelete = usePermission(PERMISSIONS.USERS_DELETE);

  const usersQuery = useAsyncData(
    () =>
      loadCollection<SafeUser>("/api/users", {
        page,
        limit: QUERY_DEFAULTS.LIMIT,
        search: search || undefined,
        role: roleFilter || undefined
      }),
    [page, search, roleFilter]
  );

  const rolesQuery = useAsyncData(
    () => loadCollection<Role>("/api/roles", { limit: 100 }),
    []
  );

  const users = usersQuery.data?.rows ?? [];
  const usersMeta = usersQuery.data?.meta;
  const roles = rolesQuery.data?.rows ?? [];
  const showInitialLoading = usersQuery.isLoading && !usersQuery.data;

  const resetForm = () => {
    setEditingUser(null);
    setForm(createInitialForm());
    setFieldErrors({});
    setFormError(null);
    setFormSuccess(null);
  };

  const validateField = (key: UserField, value: string) => {
    if (key === "name") {
      return validateRequired(value, "Full name", 2);
    }

    if (key === "email") {
      return validateEmail(value);
    }

    return validatePassword(value);
  };

  return (
    <PermissionGuard permission={PERMISSIONS.USERS_READ}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {showInitialLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : (
          <DataTableShell
            header={
              <PageSectionHeader
                title="Users"
                description="Search, filter, create, and update system users."
                action={
                  <ActionGuard permission={PERMISSIONS.USERS_CREATE}>
                    <SectionActionButton variant="secondary" onClick={resetForm}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      New User
                    </SectionActionButton>
                  </ActionGuard>
                }
              />
            }
            filters={
              <FiltersBar>
                <Input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(QUERY_DEFAULTS.PAGE);
                  }}
                />
                <Select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    setPage(QUERY_DEFAULTS.PAGE);
                  }}
                >
                  <option value="">All roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.slug}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FiltersBar>
            }
            table={
              usersQuery.error ? (
                <EmptyState
                  title="Unable to load users"
                  description={usersQuery.error}
                />
              ) : users.length === 0 ? (
                <EmptyState
                  title="No users found"
                  description="Adjust your filters or create a new user to populate this workspace."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map((role) => (
                              <Badge key={role.id} variant="secondary">
                                {role.slug}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{user.permissions.length}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate ? (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingUser(user);
                                  setFieldErrors({});
                                  setFormError(null);
                                  setFormSuccess(null);
                                  setForm({
                                    name: user.name,
                                    email: user.email,
                                    password: "",
                                    roleIds: user.roles.map((role) => role.id)
                                  });
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {canDelete ? (
                              <DeleteAction
                                title="Delete user"
                                description={`This will permanently remove ${user.name} from the workspace.`}
                                onDelete={async () => {
                                  setFormError(null);
                                  await submitEntity({
                                    path: `/api/users/${user.id}`,
                                    method: "DELETE"
                                  });
                                  await usersQuery.reload();
                                  appToast.success("User deleted successfully.");
                                }}
                              />
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            }
            pagination={
              <PaginationControls meta={usersMeta} onPageChange={(nextPage) => setPage(nextPage)} />
            }
          />
        )}
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Update user" : "Create user"}</CardTitle>
          </CardHeader>
          <CardContent>
            {!canCreate && !canUpdate ? (
              <EmptyState
                title="No mutation access"
                description="Your role can view users, but it cannot create or update them."
              />
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setFormError(null);
                  setFormSuccess(null);

                  const nextErrors = validateUserFields(form, Boolean(editingUser));
                  setFieldErrors(nextErrors);

                  if (hasValidationErrors(nextErrors)) {
                    return;
                  }

                  if (editingUser && !canUpdate) {
                    setFormError("You are not allowed to update users.");
                    return;
                  }

                  if (!editingUser && !canCreate) {
                    setFormError("You are not allowed to create users.");
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    if (editingUser) {
                      await submitEntity({
                        path: `/api/users/${editingUser.id}`,
                        method: "PUT",
                        payload: {
                          name: form.name,
                          email: form.email,
                          roleIds: form.roleIds
                        }
                      });
                    } else {
                      await submitEntity({
                        path: "/api/users",
                        method: "POST",
                        payload: form
                      });
                    }

                    const successMessage = editingUser
                      ? "User updated successfully."
                      : "User created successfully.";

                    resetForm();
                    await usersQuery.reload();
                    setFormSuccess(successMessage);
                    appToast.success(successMessage);
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "User save failed.";
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
                        setFieldError(current, "name", validateField("name", form.name))
                      )
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({ ...current, name: value }));

                      if (fieldErrors.name) {
                        setFieldErrors((current) =>
                          setFieldError(current, "name", validateField("name", value))
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
                        setFieldError(current, "email", validateField("email", form.email))
                      )
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({ ...current, email: value }));

                      if (fieldErrors.email) {
                        setFieldErrors((current) =>
                          setFieldError(current, "email", validateField("email", value))
                        );
                      }
                    }}
                  />
                  <FieldError message={fieldErrors.email} />
                </FormField>
                {!editingUser ? (
                  <FormField
                    label="Temporary password"
                    hint="Use a strong password. The backend enforces hashing and token-based auth."
                  >
                    <Input
                      type="password"
                      placeholder="Temporary password"
                      value={form.password}
                      onBlur={() =>
                        setFieldErrors((current) =>
                          setFieldError(current, "password", validateField("password", form.password))
                        )
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        setForm((current) => ({ ...current, password: value }));

                        if (fieldErrors.password) {
                          setFieldErrors((current) =>
                            setFieldError(current, "password", validateField("password", value))
                          );
                        }
                      }}
                    />
                    <FieldError message={fieldErrors.password} />
                  </FormField>
                ) : null}
                <FormField label="Assigned roles" hint="Hold command/control to select multiple roles.">
                  <Select
                    multiple
                    className="min-h-40 rounded-3xl py-3"
                    value={form.roleIds}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        roleIds: Array.from(event.target.selectedOptions).map((option) => option.value)
                      }))
                    }
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.slug})
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormSuccess message={formSuccess} />
                <FormError message={formError} />
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingUser
                      ? "Saving changes..."
                      : "Creating user..."
                    : editingUser
                      ? "Save changes"
                      : "Create user"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};
