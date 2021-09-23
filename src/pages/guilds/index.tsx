import type {
  GetServerSideProps,
  NextPage,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import { createDiscordRestClient } from "../../discord";
import {
  RESTAPIPartialCurrentUserGuild,
  RESTGetAPICurrentUserGuildsResult,
  Routes,
} from "discord-api-types/v9";
import { Permissions } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../../prisma";
import Layout from "../../components/Layout";
import {
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
} from "@mui/material";
import React from "react";

type Guild = RESTAPIPartialCurrentUserGuild & {
  isOwner: Boolean;
  isBotMaster: Boolean;
  canManage: Boolean;
  authUrl: string;
  isBotJoined: Boolean;
};

export interface GuildsProps {
  guilds: Array<Guild>;
}

const Guilds: NextPage<GuildsProps> = ({ guilds }) => {
  return (
    <Layout title="サーバー一覧">
      <Box p={2}>
        <Typography variant="body1">
          あなたのjoinしているDiscordサーバーの一覧です。Botの導入やその他の管理を行うことができます。
        </Typography>
        <Grid
          container
          py={2}
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {guilds
            .filter((guild) => guild.canManage)
            .map((guild) => {
              return (
                <Grid item xs={1} sm={2} md={3} key={guild.id}>
                  <Card>
                    {guild.icon ? (
                      <CardMedia
                        component="img"
                        image={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`}
                      />
                    ) : (
                      <CardMedia component="img" sx={{ aspectRatio: "1:1" }} />
                    )}
                    <CardHeader title={guild.name} />
                    <CardContent>
                      {guild.isBotMaster && !guild.isOwner && "管理者"}
                      {guild.isOwner && "オーナー"}
                      {!guild.isOwner && !guild.isBotMaster && "メンバー"}
                    </CardContent>
                    <CardActions>
                      {guild.canManage && (
                        <Button href={guild.authUrl}>
                          {guild.isBotJoined ? "Botの再設定" : "Botの導入"}
                        </Button>
                      )}
                      {guild.canManage && guild.isBotJoined && (
                        <Button href={`/guilds/${guild.id}/roles`}>
                          サークル設定
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<GuildsProps> = async ({
  req,
  res,
}) => {
  const data = await getSession({ req });
  const accessToken = data?.accessToken as string;
  if (!accessToken) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const userRestClient = createDiscordRestClient(accessToken);
  const guilds = (await userRestClient.get(Routes.userGuilds(), {
    authPrefix: "Bearer",
  })) as RESTGetAPICurrentUserGuildsResult;

  const joinedGuilds = await prisma.guild.findMany({
    where: {
      id: {
        in: guilds.map((guild) => guild.id),
      },
    },
  });

  prisma.$disconnect();

  const joinedGuildIds = joinedGuilds.map((guild) => guild.id);

  return {
    props: {
      guilds: guilds.map((guild) => {
        const permissions = new Permissions(BigInt(guild.permissions));
        const isOwner = guild.owner;
        const isAdmin = permissions.has(Permissions.FLAGS.MANAGE_GUILD);

        const link = encodeURIComponent(
          "http://localhost:3000/api/bot/callback"
        );
        return {
          ...guild,
          isOwner: isOwner,
          isBotMaster: isAdmin,
          canManage: isAdmin || isOwner,
          authUrl: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&redirect_uri=${link}&response_type=code&scope=bot%20applications.commands%20messages.read&guild_id=${guild.id}&disable_guild_select=true`,
          isBotJoined: joinedGuildIds.indexOf(guild.id) != -1,
        };
      }),
    },
  };
};

export default Guilds;
