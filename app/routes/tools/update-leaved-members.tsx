import { createDiscordRestClient } from "@/discord";
import { Circles, Guild } from "@/model";
import { CircleRole, MemberStatus } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import type { RESTGetAPIGuildMembersResult } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { notFound } from "~/response.server";

invariant(process.env.ADMIN_API_SECRET, "ADMIN_API_SECRET required");

export const action: ActionFunction = async ({ request }) => {
  const header = request.headers.get("X-CIRCLE-MANAGER-AUTH");

  if (header != process.env.ADMIN_API_SECRET) {
    throw new Response("Forbidden", { status: 403 });
  }

  const rest = createDiscordRestClient();
  const circleIds = Circles.activeCircles.map((circle) => circle.id as string);

  const members = (
    (await rest.get(
      `${Routes.guildMembers(Guild.id)}?limit=1000`,
    )) as RESTGetAPIGuildMembersResult
  ).filter((member) => !member.user?.bot && member.user);

  // 既に脱退しているが状態が更新されていないメンバーを脱退したことにする
  await prisma.member.updateMany({
    where: {
      id: {
        notIn: [...members.map((member) => member.user?.id!)],
      },
      status: {
        in: [MemberStatus.Joined, MemberStatus.OB],
      },
    },
    data: {
      status: MemberStatus.Leaved,
      circleKey: null,
      circleRole: CircleRole.Member,
    },
  });

  // 既に脱退しているがjoinedAtが記録されていないメンバーは今離脱したことにする
  await prisma.member.updateMany({
    where: {
      id: {
        notIn: [...members.map((member) => member.user?.id!)],
      },
      status: MemberStatus.Leaved,
      leavedAt: null,
    },
    data: {
      leavedAt: new Date(),
      circleKey: null,
      circleRole: CircleRole.Member,
    },
  });

  await prisma.member.updateMany({
    where: {
      leavedAt: { not: null },
    },
    data: {
      circleKey: null,
    },
  });

  return prisma.member.findMany({
    orderBy: [
      {
        circleKey: "asc",
      },
      {
        circleRole: "asc",
      },
      {
        joinedAt: "asc",
      },
    ],
  });
};

export const loader = () => {
  return notFound();
};
