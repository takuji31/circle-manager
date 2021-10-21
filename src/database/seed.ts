import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  await prisma.circle.createMany({
    skipDuplicates: true,
    data: [
      {
        id: '863398236474834944',
        name: 'シン・ウマ娘愛好会',
        emoji: '🇦',
        createdAt: new Date(now.getTime() - 2000),
      },
      {
        id: '870950796479594556',
        name: 'ウマ娘新愛好会：破',
        emoji: '🇧',
        createdAt: new Date(now.getTime() - 1000),
      },
      {
        id: '863398725920227339',
        name: 'ウマ娘新愛好会：序',
        emoji: '🇨',
        createdAt: now,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
