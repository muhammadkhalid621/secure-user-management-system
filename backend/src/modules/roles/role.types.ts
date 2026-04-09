export type Permission = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Role = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
};

