export type AuthTokenPayload = {
  sub: string;
  email: string;
  type: "access" | "refresh";
};

export type AuthContext = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};
