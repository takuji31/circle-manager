import { PrismaClient } from '@prisma/client';
import scuid from 'scuid';
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany({});
  prisma.$transaction(
    members.map((member) => {
      return prisma.member.update({
        where: {
          id: member.id,
        },
        data: {
          pathname: scuid() as string,
        },
      });
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
