import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dataList = [
    {
      id: '908304060640276520',
      name: '西京ファーム',
      emoji: '🇦',
      order: 10000000,
      selectableByUser: true,
      selectableByAdmin: true,
      selectableInSurvey: true,
    },
    {
      id: '863398236474834944',
      name: 'シン・ウマ娘愛好会',
      emoji: '🇧',
      order: 10000010,
      selectableByUser: true,
      selectableByAdmin: true,
      selectableInSurvey: true,
    },
    {
      id: '870950796479594556',
      name: 'ウマ娘新愛好会：破',
      emoji: '🇨',
      order: 10000100,
      selectableByUser: true,
      selectableByAdmin: true,
      selectableInSurvey: true,
    },
    {
      id: '863398725920227339',
      name: 'ウマ娘新愛好会：序',
      emoji: '🇩',
      order: 10001000,
      selectableByUser: true,
      selectableByAdmin: true,
      selectableInSurvey: true,
    },
    {
      id: '902440950176034816',
      name: '未加入',
      emoji: '',
      order: 99999995,
      selectableByUser: false,
      selectableByAdmin: false,
      selectableInSurvey: false,
    },
    {
      id: '7777777777777777777',
      name: '脱退',
      emoji: '🇪',
      order: 99999996,
      selectableByUser: false,
      selectableByAdmin: true,
      selectableInSurvey: true,
    },
    {
      id: '889835308189900810',
      name: 'OB',
      emoji: '🇫',
      order: 99999997,
      selectableByUser: false,
      selectableByAdmin: true,
      selectableInSurvey: true,
    },
    {
      id: '8888888888888888888',
      name: '除名',
      emoji: '',
      order: 99999998,
      selectableByUser: false,
      selectableByAdmin: true,
      selectableInSurvey: false,
    },
    {
      id: '9999999999999999999',
      name: '未回答',
      emoji: '',
      order: 99999999,
      selectableByUser: false,
      selectableByAdmin: false,
      selectableInSurvey: false,
    },
  ];
  for (const data of dataList) {
    await prisma.circle.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
