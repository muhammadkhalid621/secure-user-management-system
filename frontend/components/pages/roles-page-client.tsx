"use client";

import { useState } from "react";
import { Pencil, ShieldPlus, Trash2 } from "lucide-react";
import { loadCollection, submitEntity } from "@/lib/client-crud";
import { PERMISSIONS, QUERY_DEFAULTS } from "@/lib/constants";
import type { Permission, Role } from "@/lib/types";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const RolesPageClient = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(QUERY_DEFAULTS.PAGE);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    permissionIds: [] as string[]
  });

  const rolesQuery = useAsyncData(
    () =>
      loadCollection<Role>("/api/roles", {
        page,
        limit: 10,
        search: search || undefined
      }),
    [page, search]
  );
  const permissionsQuery = useAsyncData(
    () => loadCollection<Permission>("/api/roles/permissions/catalog", { limit: 100 }),
    []
  );

  const roles = rolesQuery.data?.rows ?? [];
  const rolesMeta = rolesQuery.data?.meta;
  const permissionCatalog = permissionsQuery.data?.rows ?? [];

  return (
    <PermissionGuard permission={PERMISSIONS.ROLES_READ}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTableShell
          header={
            <PageSectionHeader
              title="Roles"
              description="Define access groups and assign permissions."
              action={
                <SectionActionButton
                  variant="secondary"
                  onClick={() => {
                    setEditingRole(null);
                    setForm({ name: "", slug: "", description: "", permissionIds: [] });
                  }}
                >
                  <ShieldPlus className="mr-2 h-4 w-4" />
                  New Role
                </SectionActionButton>
              }
            />
          }
          filters={
            <FiltersBar className="md:grid-cols-1">
              <Input
                placeholder="Search by role name or slug"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(QUERY_DEFAULTS.PAGE);
                }}
              />
            </FiltersBar>
          }
          table={
            roles.length === 0 ? (
              <EmptyState title="No roles available" description="Create a role to start grouping permissions for your users." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{role.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{role.slug}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.slice(0, 4).map((permission) => (
                            <Badge key={permission.id} variant="secondary">
                              {permission.slug}
                            </Badge>
                          ))}
                          {role.permissions.length > 4 ? (
                            <Badge variant="muted">+{role.permissions.length - 4}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingRole(role);
                              setForm({
                                name: role.name,
                                slug: role.slug,
                                description: role.description ?? "",
                                permissionIds: role.permissions.map((permission) => permission.id)
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
                                path: `/api/roles/${role.id}`,
                                method: "DELETE"
                              });
                              await rolesQuery.reload();
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
            <PaginationControls meta={rolesMeta} onPageChange={(nextPage) => setPage(nextPage)} />
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? "Update role" : "Create role"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();

                const payload = {
                  name: form.name,
                  slug: form.slug,
                  description: form.description || undefined,
                  permissionIds: form.permissionIds
                };

                if (editingRole) {
                  await submitEntity({
                    path: `/api/roles/${editingRole.id}`,
                    method: "PUT",
                    payload
                  });
                } else {
                  await submitEntity({
                    path: "/api/roles",
                    method: "POST",
                    payload
                  });
                }

                setEditingRole(null);
                setForm({ name: "", slug: "", description: "", permissionIds: [] });
                await rolesQuery.reload();
              }}
            >
              <FormField label="Role name">
                <Input placeholder="Role name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </FormField>
              <FormField label="Role slug">
                <Input placeholder="role-slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
              </FormField>
              <FormField label="Description">
                <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </FormField>
              <FormField label="Permissions">
                <div className="space-y-2 rounded-3xl border border-input bg-white/80 p-4">
                  <div className="grid gap-3">
                    {permissionCatalog.map((permission) => (
                      <label key={permission.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={form.permissionIds.includes(permission.id)}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              permissionIds: event.target.checked
                                ? [...current.permissionIds, permission.id]
                                : current.permissionIds.filter((id) => id !== permission.id)
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{permission.slug}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </FormField>
              <Button className="w-full" type="submit">
                {editingRole ? "Save changes" : "Create role"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};
