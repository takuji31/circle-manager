import { NextApiRequest, NextApiResponse } from "next";
import { Circle } from "../../../model/circle";
import prisma from "../../../prisma";

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
