import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const groupRouter = createTRPCRouter({
  postGroup: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.group.create({
          data: {
            name: input.name,
            users: {
              create: [
                {
                  isAdmin: true,
                  user: {
                    connect: {
                      id: ctx.session.user.id,
                    },
                  },
                },
              ],
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
  putSuggestion: protectedProcedure
    .input(
      z.object({
        suggestion: z.string().nullish(),
        groupId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const resp = await ctx.prisma.userInGroup.update({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: input.groupId,
            },
          },
          data: {
            suggestion: input.suggestion,
          },
        });
        console.log(resp);
        return resp;
      } catch (error) {
        console.log(error);
      }
    }),
  getAllForUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findMany({
      where: {
        users: {
          some: {
            user: {
              id: {
                equals: ctx.session.user.id,
              },
            },
          },
        },
      },
    });
  }),
  getOneById: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.group.findUnique({
        where: {
          id: input.groupId,
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });
    }),
});
