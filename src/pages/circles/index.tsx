import { Box, List, ListItem } from "@mui/material";
import { RESTGetAPIGuildRolesResult, Routes } from "discord-api-types/v9";
import { Role } from "discord.js";
import { GetServerSideProps, GetStaticProps, NextPage, InferGetStaticPropsType } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import Layout from "../../components/Layout";
import { createDiscordRestClient } from "../../discord";
import { Guild } from "../../model/guild";
import { prisma } from "../../prisma";

interface Circle {
  id: string;
  name: string;
}

interface Props {
  circles: Array<Circle>;
}

const CircleList: NextPage<Props> = ({ circles }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout title={`サークル一覧`}>
      <List>
        {circles.map((circle) => {
          return <ListItem>{circle.name}</ListItem>;
        })}
      </List>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  let circles = await prisma.circle.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  if (!circles.length) {
  }

  return {
    props: {
      circles: circles.map((circle) => {
        return {
          id: circle.id,
          name: circle.name,
        };
      }),
    },
  };
};

export default CircleList;
