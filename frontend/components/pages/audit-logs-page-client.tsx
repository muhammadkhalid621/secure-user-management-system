"use client";

import { useState } from "react";
import { loadCollection } from "@/lib/client-crud";
import { PERMISSIONS } from "@/lib/constants";
import type { AuditLog } from "@/lib/types";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { useAsyncData } from "@/lib/query-hooks";
import { Badge } from "@/components/ui/badge";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FiltersBar } from "@/components/ui/filters-bar";
import { Input } from "@/components/ui/input";
import { PageSectionHeader } from "@/components/ui/page-section-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export const AuditLogsPageClient = () => {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState<number>(1);

  const logsQuery = useAsyncData(
    () =>
      loadCollection<AuditLog>("/api/audit-logs", {
        page,
        limit: 20,
        search: search || undefined,
        level: level || undefined
      }),
    [level, page, search]
  );

  const logs = logsQuery.data?.rows ?? [];
  const logsMeta = logsQuery.data?.meta;

  return (
    <PermissionGuard permission={PERMISSIONS.AUDIT_LOGS_READ}>
      logsQuery.isLoading ? (
        <TableSkeleton columns={4} rows={6} />
      ) : (
        <DataTableShell
          header={
            <PageSectionHeader
              title="Audit Logs"
              description="Search request outcomes, auth actions, websocket events, and CRUD traces."
            />
          }
          filters={
            <FiltersBar className="md:grid-cols-[1fr_180px]">
              <Input value={search} onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }} placeholder="Search message, action, or entity type" />
              <Select value={level} onChange={(event) => {
                setLevel(event.target.value);
                setPage(1);
              }}>
                <option value="">All levels</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </Select>
            </FiltersBar>
          }
          table={
            logsQuery.error ? (
              <EmptyState title="Unable to load audit logs" description={logsQuery.error} />
            ) : logs.length === 0 ? (
              <EmptyState title="No audit entries found" description="Change the search or filter settings to surface activity." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{log.message}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{log.action}</p>
                      </TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell>
                        <Badge variant={log.level === "error" ? "destructive" : log.level === "warn" ? "secondary" : "muted"}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          }
          pagination={
            <PaginationControls meta={logsMeta} onPageChange={(nextPage) => setPage(nextPage)} />
          }
        />
      )
    </PermissionGuard>
  );
};
