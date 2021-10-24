import { prisma } from '../database';
import { nextMonth } from '../model';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import { config } from 'dotenv';
import { MessageEmbed } from 'discord.js';

config();

const rest = createDiscordRestClient();

(async () => {
  try {
    const monthCircles = await prisma.monthCircle.findMany({
      include: {
        member: {
          include: {
            circle: true,
          },
        },
      },
    });
    prisma.$transaction(
      monthCircles.map((monthCircle) => {
        return prisma.monthCircle.update({
          where: {
            id: monthCircle.id,
          },
          data: {
            currentCircleId: monthCircle.member.circleId,
          },
        });
      })
    );
  } catch (error) {
    console.error(error);
  }
})();
