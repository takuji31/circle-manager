import { MonthCircleAnswerState } from ".prisma/client";
import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import Layout from "../../../../../components/layout";
import { prisma } from "../../../../../prisma";

interface PathParams extends ParsedUrlQuery {
  memberId: string;
  year: string;
  month: string;
}

interface Circle {
  id: string;
  name: string;
  selected: boolean;
}

interface Props {
  year: string;
  month: string;
  memberName: string;
  circles: Array<Circle>;
}

const MemberMonthCircle: NextPage<Props> = ({
  year,
  month,
  memberName,
  circles,
}) => {
  return (
    <Layout title={`${year}年${month}月の${memberName}さんの在籍希望`}>
      <Stack p={2} spacing={2}>
        <Typography variant="body1">在籍希望を選択してください。</Typography>
        <ToggleButtonGroup
          value={circles.find((circle) => circle.selected)?.id}
        >
          {circles.map((circle) => (
            <ToggleButton value={circle.id}>{circle.name}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props, PathParams> = async ({
  params,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }
  const year = params.year;
  const month = params.month;

  const yearInt = parseInt(year);
  const monthInt = parseInt(month);
  if (yearInt > 9999 || yearInt < 2021) {
    return {
      notFound: true,
    };
  }
  if (monthInt > 12 || monthInt < 1) {
    return {
      notFound: true,
    };
  }

  const member = await prisma.member.findUnique({
    where: { id: params.memberId },
  });

  if (!member) {
    return {
      notFound: true,
    };
  }

  const monthCircleOrNull = await prisma.monthCircle.findFirst({
    where: {
      memberId: params.memberId,
      year: year,
      month: month,
    },
  });

  const monthCircle = monthCircleOrNull
    ? monthCircleOrNull
    : await prisma.monthCircle.create({
        data: {
          memberId: params.memberId,
          year: year,
          month: month,
        },
      });

  const circles: Array<Circle> = (
    await prisma.circle.findMany({
      orderBy: {
        createdAt: "asc",
      },
    })
  ).map((circle) => ({
    id: circle.id,
    name: circle.name,
    selected: circle.id == monthCircle.circleId,
  }));

  const leaveCircle: Circle = {
    id: "leave",
    name: "脱退",
    selected: monthCircle.state == MonthCircleAnswerState.Retired,
  };

  return {
    props: {
      year: year,
      month: month,
      memberName: member.trainerName ?? member.name,
      circles: [...circles, leaveCircle],
    },
  };
};

export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString();
  const nextYear = month == "12" ? (now.getFullYear() + 1).toString() : year;
  const nextMonth = month == "12" ? "1" : (now.getMonth() + 2).toString();
  const currentMemberIds = (
    await prisma.member.findMany({
      where: {
        leavedAt: null,
      },
    })
  ).map((member) => member.id);

  [
    { month: month, year: year },
    { month: nextMonth, year: nextYear },
  ].forEach(async (obj) => {
    await prisma.monthCircle.createMany({
      data: currentMemberIds.map((memberId) => {
        return {
          memberId: memberId,
          year: obj.year,
          month: obj.month,
        };
      }),
      skipDuplicates: true,
    });
  });

  return {
    paths: await (
      await prisma.monthCircle.findMany()
    ).map((monthCircle) => ({
      params: {
        memberId: monthCircle.memberId,
        year: monthCircle.year,
        month: monthCircle.month,
      },
    })),
    fallback: "blocking",
  };
};

export default MemberMonthCircle;
