
import { lucia } from "lucia";
import { libsql } from "@lucia-auth/adapter-sqlite";

import { client } from '../db';
import { elysia, web } from 'lucia/middleware';
import { google } from '@lucia-auth/oauth/providers'
import Elysia from "elysia";
import { parseCookie, serializeCookie } from "lucia/utils";
import { OAuthRequestError } from "@lucia-auth/oauth";

export const lucia_auth = lucia({
  adapter: libsql(client, {
    user: "user",
    key: "user_key",
    session: "user_session"
  }),
  getUserAttributes(databaseUser) {
    return {
      given_name: databaseUser.given_name,
      family_name: databaseUser.family_name,
    }
  },

  middleware: elysia(),
  env: "DEV",
  sessionCookie: {
    expires: false,
  }
});

export const googleAuth = google(lucia_auth, {
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/login/google/callback",
})

export type Auth = typeof lucia_auth;

export const login_routes = new Elysia()
  .get("/login/google", async () => {
    const [url, state] = await googleAuth.getAuthorizationUrl();
    const stateCookie = serializeCookie("github_oauth_state", state, {
      httpOnly: true,
      secure: false, // `true` for production
      path: "/",
      maxAge: 60 * 60
    });
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        "Set-Cookie": stateCookie
      }
    });
  }).get("/login/google/callback", async ({ request }) => {
    const cookies = parseCookie(request.headers.get("Cookie") ?? "");
    const storedState = cookies.github_oauth_state;
    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    // validate state
    if (!storedState || !state || storedState !== state || !code) {
      return new Response(null, {
        status: 400
      });
    }
    try {
      const { getExistingUser, googleUser, createUser } =
        await googleAuth.validateCallback(code);

      const getUser = async () => {
        const existingUser = await getExistingUser();
        if (existingUser) return existingUser;
        const user = await createUser({
          attributes: {
            given_name: googleUser.given_name,
            family_name: googleUser.family_name,
          }
        });
        return user;
      };

      const user = await getUser();
      const session = await lucia_auth.createSession({
        userId: user.userId,
        attributes: {},
      });
      const sessionCookie = lucia_auth.createSessionCookie(session);
      // redirect to profile page
      return new Response(null, {
        headers: {
          Location: "/",
          "Set-Cookie": sessionCookie.serialize() // store session cookie
        },
        status: 302
      });
    } catch (e) {
      if (e instanceof OAuthRequestError) {
        // invalid code
        return new Response(null, {
          status: 400
        });
      }
      return new Response(null, {
        status: 500
      });
    }
  });




