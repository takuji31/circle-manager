import { Box } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import Layout from "../../../../components/Layout";
import { prisma } from "../../../../prisma";

interface Props {
  name: string;
}

const CircleList: NextPage<Props> = ({ name }) => {
  return (
    <Layout title={`サークル - ${name}`}>
      <Box />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getSession();
  const guildId = context.params?.guildId as string;
  const circleId = context.params?.circleId as string;
  if (!data?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else {
    prisma.circle.findUnique({
      where: {
        id = circleId,
      },
    });
  }
};

export default CircleList;
