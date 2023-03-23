import { z } from "zod";
import { randomBytes } from "crypto";

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
        const ret = await ctx.prisma.group.create({
          data: {
            name: input.name,
            ownerUserId: ctx.session.user.id,
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
        return ret;
      } catch (error) {
        console.log(error);
      }
    }),
  putNewMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.name) {
          await ctx.prisma.user.update({
            where: {
              id: ctx.session.user.id,
            },
            data: {
              name: input.name,
            },
          });
        }
        await ctx.prisma.group.update({
          where: {
            id: input.groupId,
          },
          data: {
            users: {
              create: [
                {
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
  getOneByShareCode: publicProcedure
    .input(
      z.object({
        shareCode: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.group.findFirst({
        where: {
          shareCode: input.shareCode,
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
  getRollEvents: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.rollEvent.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          user: true,
        },
      });
    }),
  generateCodeForGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const buf = randomBytes(8).toString("hex");
        const lookup = await ctx.prisma.group.findFirst({
          where: {
            shareCode: buf,
          },
        });
        if (!lookup) {
          await ctx.prisma.group.update({
            where: {
              id: input.groupId,
            },
            data: {
              shareCode: buf,
            },
          });
          return buf;
        } else {
          console.error("secret code collision. fix this");
        }
      } catch (e) {
        console.log(e);
      }
    }),
  rollTheDice: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const group = await ctx.prisma.group.findUnique({
          where: {
            id: input.groupId,
          },
          include: {
            users: true,
          },
        });

        if (!group || !group.users) {
          throw "Couldn't find group";
        }

        const highestScore = Math.max(
          ...group?.users?.filter((u) => u.suggestion).map((u) => u.points)
        );
        const winners = group?.users
          .filter((u) => u.suggestion)
          .filter((u) => u.points === highestScore);
        const winner =
          winners.length === 1
            ? winners[0]
            : winners[Math.floor(Math.random() * winners.length)];
        const losers = group?.users
          .filter((u) => u.suggestion)
          .filter((u) => u.userId !== winner?.userId);

        if (winner && winner.suggestion) {
          await ctx.prisma.rollEvent.create({
            data: {
              userId: ctx.session.user.id,
              groupId: input.groupId,
              winningSuggestion: winner?.suggestion,
            },
          });

          await ctx.prisma.userInGroup.update({
            where: {
              userId_groupId: {
                groupId: input.groupId,
                userId: winner.userId,
              },
            },
            data: {
              points: 0,
            },
          });

          for (let i = 0; i < losers?.length; i++) {
            await ctx.prisma.userInGroup.update({
              where: {
                userId_groupId: {
                  groupId: input.groupId,
                  userId: losers[i]?.userId as string,
                },
              },
              data: {
                points: (losers[i]?.points as number) + 1,
              },
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    }),
});
