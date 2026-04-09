export type UserRole = {
  id: string;
  name: string;
  slug: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, "passwordHash">;
