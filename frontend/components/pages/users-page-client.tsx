"use client";

import { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { loadCollection, submitEntity } from "@/lib/client-crud";
import { PERMISSIONS, QUERY_DEFAULTS } from "@/lib/constants";
import type { Role, SafeUser } from "@/lib/types";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { useAsyncData } from "@/lib/query-hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FiltersBar } from "@/components/ui/filters-bar";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageSectionHeader, SectionActionButton } from "@/components/ui/page-section-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const UsersPageClient = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState<number>(QUERY_DEFAULTS.PAGE);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleIds: [] as string[]
  });

  const usersQuery = useAsyncData(
    () =>
      loadCollection<SafeUser>("/api/users", {
        page,
        limit: 10,
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

  const resetForm = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      roleIds: []
    });
  };

  return (
    <PermissionGuard permission={PERMISSIONS.USERS_READ}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DataTableShell
          header={
            <PageSectionHeader
              title="Users"
              description="Search, filter, create, and update system users."
              action={
                <SectionActionButton variant="secondary" onClick={resetForm}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  New User
                </SectionActionButton>
              }
            />
          }
          filters={
            <FiltersBar>
              <Input placeholder="Search by name or email" value={search} onChange={(event) => {
                setSearch(event.target.value);
                setPage(QUERY_DEFAULTS.PAGE);
              }} />
              <Select value={roleFilter} onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(QUERY_DEFAULTS.PAGE);
              }}>
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
            usersQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading users...</p>
            ) : users.length === 0 ? (
              <EmptyState title="No users found" description="Adjust your filters or create a new user to populate this workspace." />
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
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingUser(user);
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              await submitEntity({
                                path: `/api/users/${user.id}`,
                                method: "DELETE"
                              });
                              await usersQuery.reload();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Update user" : "Create user"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();

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

                resetForm();
                await usersQuery.reload();
              }}
            >
              <FormField label="Full name">
                <Input placeholder="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </FormField>
              <FormField label="Email address">
                <Input type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </FormField>
              {!editingUser ? (
                <FormField label="Temporary password">
                  <Input type="password" placeholder="Temporary password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
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
              <Button className="w-full" type="submit">
                {editingUser ? "Save changes" : "Create user"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};
