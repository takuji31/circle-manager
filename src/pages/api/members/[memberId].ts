import { JST } from "./../../../model/time";
import { Temporal } from "proposal-temporal";
import prisma from "./../../../prisma";
import { WithError } from "./../../../model/api_type";
import { getSession } from "next-auth/react";
import { NextApiHandler } from "next";
import { Member } from "../../../model/member";
const handler: NextApiHandler<WithError<Member>> = async (req, res) => {
  const memberId = req.query.memberId as string;
  const thisMonth = Temporal.now.zonedDateTimeISO(JST).toPlainYearMonth();
  const nextMonth = thisMonth.add(Temporal.Duration.from({ months: 1 }));
  let member;
  if (memberId == "@me") {
    const session = await getSession({ req });
    const id = session?.id as string;
    if (session?.isMember && id) {
      member = await prisma.member.findUnique({
        where: { id: id },
        include: {
          circle: true,
          monthCircles: {
            where: {
              OR: [
                {
                  year: thisMonth.year.toString(),
                  month: thisMonth.month.toString(),
                },
                {
                  year: nextMonth.year.toString(),
                  month: nextMonth.month.toString(),
                },
              ],
            },
          },
        },
      });
    } else {
      res.status(403).send({ error: "Forbidden" });
      return;
    }
  } else {
    member = await prisma.member.findUnique({ where: { id: memberId } });
  }
  if (!member) {
    res.status(404).send({ error: "Not found" });
    return;
  } else {
    res.send({
      id: member.id,
      name: member.name,
      circle: 
    });
  }
};

export default handler;
