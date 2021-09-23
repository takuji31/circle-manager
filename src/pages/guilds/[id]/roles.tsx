import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Layout from "../../../components/Layout";
import { createDiscordRestClient } from "../../../discord";
import {
  APIGuild,
  APIRole,
  RESTGetAPIGuildResult,
  RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v9";
import { PrismaClient } from "@prisma/client";
import useCircle from "../../../hooks/circle";
import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";

type Role = APIRole & {
  isCircleRole: boolean;
};

export interface GuildDetailProps {
  guild: APIGuild;
  roles: Array<Role>;
}

const GuildDetail: NextPage<GuildDetailProps> = ({ guild, roles }) => {
  return (
    <Layout title={`サークル設定 - ${guild.name}`}>
      <Box p={2}>
        <Typography variant="body1">
          サークルとして扱うロールを設定できます
        </Typography>
        <List sx={{ width: "100%", maxWidth: "360pt" }}>
          {roles.map((role) => {
            const { circle, onCreate } = useCircle(guild.id, role.id);
            return (
              <ListItem key={"role_" + role.id}>
                <ListItemText
                  primary={role.name}
                  secondary={
                    (role.isCircleRole || circle != null) && "サークル"
                  }
                />
                <Button onClick={async () => await onCreate()}>
                  サークルとして設定
                </Button>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<GuildDetailProps> = async (
  context
) => {
  const data = await getSession(context);
  const id = context.params?.id as string;
  const accessToken = data?.accessToken as string;
  if (!accessToken) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const rest = createDiscordRestClient(process.env.DISCORD_BOT_TOKEN as string);
  const guild = (await rest.get(Routes.guild(id))) as RESTGetAPIGuildResult;
  if (guild == null) {
    return {
      notFound: true,
    };
  }
  const prisma = new PrismaClient();

  await prisma.guild.upsert({
    where: { id: guild.id },
    create: {
      id: guild.id,
      name: guild.name,
    },
    update: {
      name: guild.name,
    },
  });

  const roles = (await rest.get(
    Routes.guildRoles(id)
  )) as RESTGetAPIGuildRolesResult;
  if (roles == null) {
    return {
      notFound: true,
    };
  }

  roles.forEach(async (apiRole) => {
    await prisma.role.upsert({
      where: {
        id: apiRole.id,
      },
      create: {
        id: apiRole.id,
        guildId: guild.id,
        name: apiRole.name,
      },
      update: {
        name: apiRole.name,
      },
    });
  });

  const circleIds = (
    await prisma.circle.findMany({
      select: {
        id: true,
      },
      where: {
        id: {
          in: roles.map((apiRole) => apiRole.id),
        },
      },
    })
  ).map((role) => role.id);

  return {
    props: {
      guild: guild,
      roles: roles.map((apiRole) => {
        return {
          ...apiRole,
          isCircleRole: circleIds.indexOf(apiRole.id) != -1,
        };
      }),
    },
  };
};

export default GuildDetail;
