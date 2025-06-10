// import { prisma } from "@/lib/prisma";
// import { compare } from "bcryptjs";
// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions: NextAuthOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Sign in",
//       credentials: {
//         email: {
//           label: "Email",
//           type: "email",
//           placeholder: "example@example.com",
//         },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials.password) {
//           return null;
//         }

//         const user = await prisma.user.findUnique({
//           where: {
//             email: credentials.email,
//           },
//         });

//         if (!user || !(await compare(credentials.password, user.password))) {
//           return null;
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           randomKey: "Some random Key",
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       console.log("Session Callback", { session, token });
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: token.id,
//           randomKey: token.randomKey,
//         },
//       };
//     },
//     async jwt({ token, user }) {
//       console.log("JWT Callback", { token, user });
//       if (user) {
//         const u = user as unknown as any;
//         return {
//           ...token,
//           id: u.id,
//           randomKey: u.randomKey,
//         };
//       }
//       return token;
//     },
//   },
// };

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type UserWithRandomKey = User & {
  id: string;
  randomKey: string;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          randomKey: "Some random Key",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback", { token, user });

      if (user) {
        const u = user as UserWithRandomKey;

        token.id = u.id;
        token.randomKey = u.randomKey;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback", { session, token });

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
  },
};
