import type { Transaction } from "sequelize";
import { sequelize } from "../database/sequelize.js";

type AfterCommitHook = () => Promise<void> | void;

export const withTransaction = async <T>(
  callback: (transaction: Transaction, onCommit: (hook: AfterCommitHook) => void) => Promise<T>
) => {
  return sequelize.transaction(async (transaction) => {
    const afterCommitHooks: AfterCommitHook[] = [];

    transaction.afterCommit(async () => {
      for (const hook of afterCommitHooks) {
        try {
          await hook();
        } catch (error) {
          console.error("Post-commit side effect failed", error);
        }
      }
    });

    return callback(transaction, (hook) => {
      afterCommitHooks.push(hook);
    });
  });
};
