import { DateFormats, monthSurveyAnswerLabel, nextMonthInt } from "@/model";
import { ZonedDateTime } from "@js-joda/core";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { DataFunctionArgs, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { AdminBody } from "~/components/admin/body";
import { prisma } from "~/db.server";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData(args: DataFunctionArgs) {
  const { year, month } = nextMonthInt();
  const survey = await prisma.monthSurvey.findFirst({ where: { year, month } }).then(s => {
    if (!s) {
      return null;
    }
    return {
      ...s,
      expiredAt: ZonedDateTime.fromDate(s.expiredAt).format(DateFormats.dateWithHour),
      finished: ZonedDateTime.fromDate(s.expiredAt).isBefore(ZonedDateTime.now()),
    };
  });
  const answers = await prisma.monthSurveyAnswer.groupBy({
    where: { year, month, member: {leavedAt: null} },
    by: ["year", "month", "value"],
    _count: { value: true },
    orderBy: {value: 'asc'}
  });
  return { survey, answers };
}

export const loader: LoaderFunction = async (args) => {
  return await getLoaderData(args);
};

export default function AdminIndex() {
  const { survey, answers } = useLoaderData<LoaderData>();
  return (
    <AdminBody>
      <Card>
        <CardHeader title="在籍希望アンケート" />
        <CardContent>
          {survey ? (
            <Stack spacing={2}>
              <Typography variant="body1">{survey.finished ? "終了済み" : `終了前 期限: ${survey.expiredAt}`}</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>回答</TableCell>
                    <TableCell>人数</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {answers.map(a => {
                    return <TableRow key={a.value}>
                      <TableCell>
                        {monthSurveyAnswerLabel(a.value!)}
                      </TableCell>
                      <TableCell>
                        {a._count.value}
                      </TableCell>
                    </TableRow>;
                  })}
                </TableBody>
              </Table>
            </Stack>
          ) : <Typography variant="subtitle1">在籍希望アンケートは開始されていません。</Typography>}
        </CardContent>
      </Card>
    </AdminBody>
  );
}
