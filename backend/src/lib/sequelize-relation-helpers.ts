import type { Transaction } from "sequelize";

type ModelWithId = {
  id: string;
  update: (values: Record<string, unknown>, options?: { transaction?: Transaction }) => Promise<unknown>;
  destroy: (options?: { transaction?: Transaction }) => Promise<void>;
  toJSON: () => unknown;
};

type FindByPk<TModel> = (
  id: string,
  options: { include: any; transaction?: Transaction }
) => Promise<TModel | null>;

const applyRelationIds = async (
  model: Record<string, unknown>,
  setterName: string,
  ids: string[] | undefined,
  transaction?: Transaction
) => {
  if (!ids) {
    return;
  }

  const setter = model[setterName];

  if (typeof setter !== "function") {
    throw new Error(`Missing relation setter: ${setterName}`);
  }

  await (
    setter as (
      relationIds: string[],
      options?: { transaction?: Transaction }
    ) => Promise<void>
  ).call(model, ids, { transaction });
};

export const createWithRelations = async <TModel extends ModelWithId, TResult>({
  create,
  findByPk,
  include,
  attributes,
  relationSetterName,
  relationIds,
  map,
  transaction
}: {
  create: () => Promise<TModel>;
  findByPk: FindByPk<TModel>;
  include: any;
  attributes?: Record<string, unknown>;
  relationSetterName?: string;
  relationIds?: string[];
  map: (model: TModel) => TResult;
  transaction?: Transaction;
}) => {
  const model = await create();

  if (attributes) {
    await model.update(attributes, { transaction });
  }

  if (relationSetterName) {
    await applyRelationIds(
      model as Record<string, unknown>,
      relationSetterName,
      relationIds,
      transaction
    );
  }

  const refreshed = await findByPk(model.id, { include, transaction });

  if (!refreshed) {
    throw new Error(`Failed to reload model: ${model.id}`);
  }

  return map(refreshed);
};

export const updateWithRelations = async <TModel extends ModelWithId, TResult>({
  id,
  findByPk,
  include,
  attributes,
  relationSetterName,
  relationIds,
  map,
  transaction
}: {
  id: string;
  findByPk: FindByPk<TModel>;
  include: any;
  attributes: Record<string, unknown>;
  relationSetterName?: string;
  relationIds?: string[];
  map: (model: TModel) => TResult;
  transaction?: Transaction;
}) => {
  const model = await findByPk(id, { include, transaction });

  if (!model) {
    return undefined;
  }

  await model.update(attributes, { transaction });

  if (relationSetterName) {
    await applyRelationIds(
      model as Record<string, unknown>,
      relationSetterName,
      relationIds,
      transaction
    );
  }

  const refreshed = await findByPk(id, { include, transaction });

  if (!refreshed) {
    throw new Error(`Failed to reload model: ${id}`);
  }

  return map(refreshed);
};

export const deleteAndReturn = async <TModel extends ModelWithId, TResult>({
  id,
  findByPk,
  include,
  map,
  transaction
}: {
  id: string;
  findByPk: FindByPk<TModel>;
  include: any;
  map: (model: TModel) => TResult;
  transaction?: Transaction;
}) => {
  const model = await findByPk(id, { include, transaction });

  if (!model) {
    return undefined;
  }

  const snapshot = map(model);
  await model.destroy({ transaction });
  return snapshot;
};
