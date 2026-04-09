type ModelWithId = {
  id: string;
  update: (values: Record<string, unknown>) => Promise<unknown>;
  destroy: () => Promise<void>;
  toJSON: () => unknown;
};

type FindByPk<TModel> = (id: string, options: { include: any }) => Promise<TModel | null>;

const applyRelationIds = async (
  model: Record<string, unknown>,
  setterName: string,
  ids: string[] | undefined
) => {
  if (!ids) {
    return;
  }

  const setter = model[setterName];

  if (typeof setter !== "function") {
    throw new Error(`Missing relation setter: ${setterName}`);
  }

  await (setter as (relationIds: string[]) => Promise<void>).call(model, ids);
};

export const createWithRelations = async <TModel extends ModelWithId, TResult>({
  create,
  findByPk,
  include,
  attributes,
  relationSetterName,
  relationIds,
  map
}: {
  create: () => Promise<TModel>;
  findByPk: FindByPk<TModel>;
  include: any;
  attributes?: Record<string, unknown>;
  relationSetterName?: string;
  relationIds?: string[];
  map: (model: TModel) => TResult;
}) => {
  const model = await create();

  if (attributes) {
    await model.update(attributes);
  }

  if (relationSetterName) {
    await applyRelationIds(model as Record<string, unknown>, relationSetterName, relationIds);
  }

  const refreshed = await findByPk(model.id, { include });

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
  map
}: {
  id: string;
  findByPk: FindByPk<TModel>;
  include: any;
  attributes: Record<string, unknown>;
  relationSetterName?: string;
  relationIds?: string[];
  map: (model: TModel) => TResult;
}) => {
  const model = await findByPk(id, { include });

  if (!model) {
    return undefined;
  }

  await model.update(attributes);

  if (relationSetterName) {
    await applyRelationIds(model as Record<string, unknown>, relationSetterName, relationIds);
  }

  const refreshed = await findByPk(id, { include });

  if (!refreshed) {
    throw new Error(`Failed to reload model: ${id}`);
  }

  return map(refreshed);
};

export const deleteAndReturn = async <TModel extends ModelWithId, TResult>({
  id,
  findByPk,
  include,
  map
}: {
  id: string;
  findByPk: FindByPk<TModel>;
  include: any;
  map: (model: TModel) => TResult;
}) => {
  const model = await findByPk(id, { include });

  if (!model) {
    return undefined;
  }

  const snapshot = map(model);
  await model.destroy();
  return snapshot;
};
