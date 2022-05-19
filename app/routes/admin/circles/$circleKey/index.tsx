import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { Params } from "react-router";
import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";
import { notFound } from "~/response.server";
import { Circles, LocalDate, Period } from "@/model";
import { getDatesFrom } from "~/model/date.server";
import { Card, CardHeader } from "@mui/material";
import { Grid } from "@mui/material";
import { Paper } from "@mui/material";
import { Typography } from "@mui/material";
import { CardActionArea } from "@mui/material";
import { CardContent } from "@mui/material";
import { Box } from "@mui/system";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const paramsSchema = z.object({
  circleKey: ActiveCircleKey,
});

export const getLoaderData = async (params: Params<string>) => {
  const result = paramsSchema.safeParse(params);
  if (!result.success) {
    throw notFound();
  }
  const { circleKey } = result.data;
  return {
    circle: Circles.findByCircleKey(circleKey),
    dates: getDatesFrom({
      start: LocalDate.today(),
      period: Period.ofDays(-30),
    }),
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  return await getLoaderData(params);
};

export default function AdminCirclesCircleKey() {
  const { circle, dates } = useLoaderData<LoaderData>();
  return (
    <Box p={2}>
      <Card>
        <CardHeader title="ファン数記録・確認" />
        <Grid container spacing={2} mt={3}>
          {dates.map((date) => (
            <Grid
              item
              key={`${date.year}${date.month}${date.day}`}
              xs={6}
              sm={3}
              lg={2}
            >
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea
                  component={Link}
                  to={`/admin/circles/${circle.key}/fans/${date.year}/${date.month}/${date.day}`}
                >
                  <CardContent>
                    <Typography variant="body1">
                      {`${date.year}/${date.month}/${date.day}`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
}
