/// <reference types="lucia" />

declare namespace Lucia {
  type Auth = import("./auth/auth.ts").Auth;
  type DatabaseUserAttributes = {
    given_name: string;
    family_name: string;
    email?: string;
    sub: string;
  };
  type DatabaseSessionAttributes = {};
}

declare namespace JSX {
}
