import {PrismaClient} from '@prisma/client';
import {RESTGetAPIGuildRolesResult, Routes} from 'discord-api-types';
import {createDiscordRestClient} from 'server/src/discord';

const Guild = {
  id: '839400642664595506',
  circles: [
    '863398236474834944', // shin
    '870950796479594556', // ha
    '863398725920227339', // jo
  ],
};

const prisma = new PrismaClient();
async function seed() {
  const rest = createDiscordRestClient(process.env.DISCORD_BOT_TOKEN as string);
  const roles = (await rest.get(
    Routes.guildRoles(Guild.id)
  )) as RESTGetAPIGuildRolesResult;
  prisma.circle.createMany({
    data: roles
      .filter(apiRole => Guild.circles.indexOf(apiRole.id) != -1)
      .map(apiRole => {
        return {
          id: apiRole.id,
          name: apiRole.name,
        };
      }),
    skipDuplicates: false,
  });
}

export function main() {
  seed()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
