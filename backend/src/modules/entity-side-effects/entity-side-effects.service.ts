import { auditLogService } from "../audit-logs/audit-log.service.js";
import { notificationService } from "../notifications/notification.service.js";

export type MutationAction = "create" | "update" | "delete";

export class EntitySideEffectsService<TEntity extends { id: string }> {
  constructor(
    private readonly entityType: string,
    private readonly getMessage: (action: MutationAction) => string,
    private readonly getNotificationMessage: (action: MutationAction) => string,
    private readonly getMetadata: (entity: TEntity) => Record<string, unknown>,
    private readonly invalidate?: (entity: TEntity) => Promise<void>
  ) {}

  async onMutation(input: {
    action: MutationAction;
    actorUserId?: string | null;
    entity: TEntity;
  }) {
    if (this.invalidate) {
      await this.invalidate(input.entity);
    }

    await Promise.all([
      auditLogService.recordCrud({
        actorUserId: input.actorUserId ?? null,
        entityType: this.entityType,
        entityId: input.entity.id,
        action: input.action,
        message: this.getMessage(input.action),
        metadata: this.getMetadata(input.entity)
      }),
      notificationService.enqueue({
        event: `${this.entityType}.${input.action}`,
        message: this.getNotificationMessage(input.action),
        entityType: this.entityType,
        entityId: input.entity.id,
        actorUserId: input.actorUserId ?? null,
        payload: {
          [this.entityType]: input.entity
        }
      })
    ]);
  }
}
