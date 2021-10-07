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
import { useMonthCircle } from "../../../../../hooks/month_circle";
import prisma from "../../../../../prisma";

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
  member: {
    id: string;
    name: string;
  };
}

const MemberMonthCircle: NextPage<Props> = ({ year, month, member }) => {
  const { monthCircle, error, onUpdate } = useMonthCircle(
    member.id,
    year,
    month
  );
  return (
    <Layout title={`${year}年${month}月の${member.name}さんの在籍希望`}>
      <Stack p={2} spacing={2}>
        <Typography variant="body1">在籍希望を選択してください。</Typography>
        {!monthCircle && <p>Loading...</p>}
        {monthCircle && (
          <ToggleButtonGroup
            value={monthCircle.circles.find((circle) => circle.selected)?.id}
          >
            {monthCircle.circles.map((circle) => (
              <ToggleButton
                value={circle.id}
                key={`month_circle_toggle_${circle.id}`}
                onClick={() => {
                  onUpdate(circle.id).finally(() => {});
                }}
              >
                {circle.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
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

  return {
    props: {
      year: year,
      month: month,
      member: {
        id: member.id,
        name: member.trainerName ?? member.name,
      },
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
