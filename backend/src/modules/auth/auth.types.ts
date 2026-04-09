export type AuthTokenPayload = {
  sub: string;
  email: string;
  type: "access" | "refresh";
  exp: number;
  iat: number;
};

export type AuthContext = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};
