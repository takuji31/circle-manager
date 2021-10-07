import { MonthCircle } from ".prisma/client";
import { MonthCircleAnswerState } from "@prisma/client";
import { NextApiHandler } from "next";
import prisma from "../../../../../../prisma";

export interface Circle {
  id: string;
  name: string;
  selected: boolean;
}

export interface APIMonthCircle {
  year: string;
  month: string;
  member: {
    id: string;
    name: string;
  };
  circles: Array<Circle>;
}

export interface APIMonthCircleRequest {
  circleId: string;
}

const handler: NextApiHandler<APIMonthCircle | { error: string }> = async (
  req,
  res
) => {
  const year = req.query.year as string;
  const month = req.query.month as string;
  const memberId = req.query.memberId as string;

  const yearInt = parseInt(year);
  const monthInt = parseInt(month);
  if (yearInt > 9999 || yearInt < 2021 || monthInt > 12 || monthInt < 1) {
    res.status(400).send({ error: "Bad month parameters" });
    return;
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    res.status(404).send({ error: "Not found" });
    return;
  }

  let monthCircle: MonthCircle | null = null;
  if (req.method == "POST") {
    // TODO: update
    const json = JSON.parse(req.body) as APIMonthCircleRequest;
    const circleId = json.circleId != "leave" ? json.circleId : null;
    const state =
      json.circleId == "leave"
        ? MonthCircleAnswerState.Retired
        : MonthCircleAnswerState.Answered;
    monthCircle = await prisma.monthCircle.upsert({
      where: {
        year_month_memberId: {
          year,
          month,
          memberId,
        },
      },
      create: {
        year,
        month,
        circleId,
        memberId,
        state,
      },
      update: {
        circleId,
        state,
      },
    });
  } else {
    monthCircle = await prisma.monthCircle.upsert({
      where: {
        year_month_memberId: { year, month, memberId },
      },
      create: {
        year,
        month,
        memberId,
      },
      update: {},
    });
  }

  const circles: Array<Circle> = (
    await prisma.circle.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })
  ).map((circle) => ({
    id: circle.id,
    name: circle.name,
    selected: circle.id == monthCircle!!.circleId,
  }));

  const leaveCircle: Circle = {
    id: "leave",
    name: "脱退",
    selected: monthCircle.state == MonthCircleAnswerState.Retired,
  };

  res.send({
    year: year,
    month: month,
    member: {
      id: member.id,
      name: member.trainerName ?? member.name,
    },
    circles: [...circles, leaveCircle],
  });
};

export default handler;
