import { Circles, LocalDate } from "@/model";
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CardHeader,
  NoSsr,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs, LoaderFunction } from "@remix-run/server-runtime";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import numeral from "numeral";
import randomColor from "randomcolor";
import React, { useMemo } from "react";
import { atom, useRecoilState } from "recoil";
import { z } from "zod";
import { Line } from "~/components/chartjs.client";
import { getCircleFanCountGraph } from "~/model/member_fan_count.server";
import { localStorageEffect } from "~/recoil";
import { notFound } from "~/response.server";
import { YMD } from "~/schema/date";
import { ActiveCircleKey } from "~/schema/member";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const paramsSchema = z.intersection(
  z.object({
    circleKey: ActiveCircleKey,
  }),
  YMD,
);

const getLoaderData = async ({ params }: DataFunctionArgs) => {
  const result = paramsSchema.safeParse(params);
  if (!result.success) {
    throw notFound();
  }
  const { circleKey, year, month, day } = result.data;
  let date;
  try {
    date = LocalDate.of(year, month, day);
  } catch (e) {
    throw notFound();
  }

  const graphData = await getCircleFanCountGraph({ date, circleKey });

  if (!graphData) {
    throw notFound();
  }

  const circle = Circles.findByCircleKey(circleKey);

  return { ...graphData, circle, year, month, day };
};

export const loader: LoaderFunction = async (args) => {
  return await getLoaderData(args);
};

const SortOrder = z.enum(["total", "avg"]);

const sortOrderState = atom({
  key: "circleFanCounts_sortOrder",
  default: SortOrder.enum.total,
  effects: [localStorageEffect("circleFanCounts_sortOrder")],
});

export default function CirclesFansYMD() {
  const { circleFanCount, circle, year, month, day, memberFanCounts, diffGraphData } =
    useLoaderData<LoaderData>();
  const [sortOrder, setSortOrder] = useRecoilState(sortOrderState);
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const colors = useMemo(
    () => randomColor({ luminosity: dark ? "light" : undefined, count: 27 }),
    [dark],
  );
  const gridAndTextColor = dark ? "rgba(255, 255, 255, 0.8)" : undefined;
  return (
    <Box flexGrow={1}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" flexGrow={1}>
            {circle.name}の{year}年{month}月{day}日のファン数
          </Typography>
        </Toolbar>
      </AppBar>
      <Stack p={2} spacing={2}>
        <Card>
          <CardHeader title="日別グラフ" />
          <CardContent>
            <NoSsr>
              {/* TODO: 累計グラフとの切り替え */}
              <Line
                data={{
                  ...diffGraphData,
                  datasets: diffGraphData.datasets.map(({ ...d }, idx) => {
                    return {
                      ...d,
                      borderColor: colors[idx],
                      backgroundColor: colors[idx],
                    };
                  }),
                }}
                options={{
                  animation: false,
                  backgroundColor: "rgba(0, 0, 0, 0.0)",
                  color: gridAndTextColor,
                  plugins: { tooltip: { mode: "point", intersect: false } },
                  scales: {
                    x: {
                      grid: {
                        color: gridAndTextColor,
                      },
                      ticks: {
                        color: gridAndTextColor,
                      },
                      title: {
                        display: true,
                        text: "集計日",
                        color: gridAndTextColor,
                      },
                    },
                    y: {
                      grid: {
                        color: gridAndTextColor,
                      },
                      ticks: {
                        color: gridAndTextColor,
                      },
                      title: {
                        display: true,
                        text: "獲得ファン数",
                        color: gridAndTextColor,
                      },
                    },

                  },
                }}
              />
            </NoSsr>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="ファン数ランキング"
          />
          <CardContent className='overflow-x-auto'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="text-right">順位</TableCell>
                  <TableCell>トレーナー名</TableCell>
                  <TableCell className="text-right">月の獲得ファン数</TableCell>
                  <TableCell className="text-right">獲得ファン数/日</TableCell>
                  <TableCell className="text-right">前回集計からの差分</TableCell>
                  <TableCell>前回集計日</TableCell>
                  {/*<TableCell>貢献度</TableCell>*/}
                </TableRow>
              </TableHead>
              <TableBody>
                {memberFanCounts.map((m, idx) => {
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-right">{idx + 1}</TableCell>
                      <TableCell>{m.member?.name}</TableCell>
                      <TableCell className="font-mono text-right">{numeral(m.monthlyTotal).format("0,0")}</TableCell>
                      <TableCell className="font-mono text-right">{numeral(m.monthlyAvg).format("0,0")}</TableCell>
                      <TableCell
                        className="font-mono text-right">{m.diffFromBefore != null ? numeral(m.diffFromBefore).format("0,0") : "未集計"}</TableCell>
                      <TableCell>{m.beforeRecordedAt ?? "未集計"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
