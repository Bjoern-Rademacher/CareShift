import "server-only";

import { prisma } from "@/lib/db/prisma";

type GetUserByAuthIdentityInput = {
  authProvider: string;
  authSubject: string;
};

export async function getUserByAuthIdentity({
  authProvider,
  authSubject,
}: GetUserByAuthIdentityInput) {
  return prisma.user.findUnique({
    where: {
      authProvider_authSubject: {
        authProvider,
        authSubject,
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}
