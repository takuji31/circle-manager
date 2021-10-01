import { RESTGetAPIGuildRolesResult, Routes } from "discord-api-types/v9";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createDiscordRestClient } from "../../../discord";
import { Circle } from "../../../model/circle";
import { Guild } from "../../../model/guild";
import { prisma } from "../../../prisma";

export interface APICircles {
  circles: Array<Circle>;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<APICircles>
) => {
  const circles = await prisma.circle.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  res.send({
    circles: circles.map((circle) => {
      return {
        id: circle.id,
        name: circle.name,
      };
    }),
  });
};
