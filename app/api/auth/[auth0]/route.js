// app/api/auth/[auth0]/route.js
import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/work',
  }),
  callback: handleCallback({
    afterCallback: async (req, res, session, state) => {
      // You can add custom logic here, e.g., creating a user in your database
      // await createUserInDatabase(session.user);

      // Redirect to the '/work' page after successful authentication
      if (session) {
        return {
          ...session,
          returnTo: '/work'
        };
      }
      return session;
    },
  }),
});