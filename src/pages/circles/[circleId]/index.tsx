import { Box } from "@mui/material";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import React from "react";
import Layout from "../../../components/layout";
import { Circle } from "../../../model/circle";
import { prisma } from "../../../prisma";

interface Props extends Circle {}

const CircleDetail: NextPage<Props> = ({ name, id }: Props) => {
  return (
    <Layout title={name}>
      <Box>{id}</Box>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const circleId = context.params?.circleId as string;
  const circle = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!circle) {
    return {
      notFound: true,
    };
  } else {
    return {
      props: {
        id: circle.id,
        name: circle.name,
      },
      revalidate: 10 * 60,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: (
      await prisma.circle.findMany({
        orderBy: { createdAt: "asc" },
      })
    ).map((circle) => {
      return {
        params: {
          circleId: circle.id,
        },
      };
    }),
    fallback: "blocking",
  };
};

export default CircleDetail;
