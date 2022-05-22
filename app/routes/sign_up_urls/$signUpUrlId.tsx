import {
  AppBar,
  Box,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import type { DataFunctionArgs } from "@remix-run/server-runtime";
import React, { useMemo } from "react";
import { z } from "zod";
import { authenticator } from "~/auth.server";
import { prisma } from "~/db.server";
import { notFound } from "~/response.server";
import { useMatchesData } from "~/utils";

const StepId = z.enum(["login", "name", "trainerId", "circle", "completed"]);
// eslint-disable-next-line @typescript-eslint/no-redeclare
type StepId = z.infer<typeof StepId>;

const steps = [
  { id: StepId.enum.login, name: "ログイン", path: "/" },
  { id: StepId.enum.name, name: "トレーナー名登録", path: "/name" },
  {
    id: StepId.enum.trainerId,
    name: "トレーナーID登録",
    path: "/trainer_id",
  },
  {
    id: StepId.enum.completed,
    name: "完了",
    path: "/completed",
  },
];

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

export const meta: MetaFunction = ({ data }) => {
  return {
    title: "加入申請 - ウマ娘愛好会",
  };
};

const getLoaderData = async ({ request, params }: DataFunctionArgs) => {
  const { signUpUrlId } = z.object({ signUpUrlId: z.string() }).parse(params);
  const user = await authenticator.isAuthenticated(request);
  const basePath = `/sign_up_urls/${signUpUrlId}`;
  const signUpUrl = await prisma.signUpUrl.findUnique({
    where: { id: signUpUrlId },
  });
  if (!signUpUrl) {
    throw notFound();
  }
  if (
    !request.url.endsWith("/completed") &&
    !request.url.endsWith("/completed/") &&
    signUpUrl.memberId != null
  ) {
    throw redirect(`${basePath}/completed`);
  }
  return {
    basePath,
    baseUrl: process.env.BASE_URL,
    user,
    signUpUrl,
  };
};

export const loader: LoaderFunction = async (args) => {
  return getLoaderData(args);
};

export default function MemberPathnameSetupRoot() {
  const { basePath } = useLoaderData<LoaderData>();
  const location = useLocation();
  const currentStepIdx = useMemo(
    () =>
      steps.findIndex(
        (step) => location.pathname === `${basePath}${step.path}`
      ),
    [basePath, location]
  );
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ウマ娘愛好会グループ加入申請
          </Typography>
        </Toolbar>
      </AppBar>
      <Stack spacing={2} p={2}>
        <Stepper
          activeStep={currentStepIdx != -1 ? currentStepIdx : 0}
          orientation={largeScreen ? "horizontal" : "vertical"}
        >
          {steps.map(({ id, path, name }, index) => {
            const stepProps: { completed?: boolean } = {};
            return (
              <Step key={id} {...stepProps}>
                <StepLabel>{name}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Outlet />
      </Stack>
    </Box>
  );
}

export const useSingUpUrlData = () => {
  const data = useMatchesData(`routes/sign_up_urls/$signUpUrlId`);
  return data as LoaderData;
};
