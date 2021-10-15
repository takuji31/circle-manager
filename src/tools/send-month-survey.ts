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
    const month = nextMonth();
    const embed = new MessageEmbed()
      .setTitle(`${month.year}年${month.month}月の在籍希望アンケート`)
      .setDescription(
        '来月の在籍希望に関するアンケートです。\n**来月も同じサークルに所属する場合も**必ずご回答ください！\n回答を受け付けたらリアクションは消えます、ご注意ください。'
      )
      .addField('期限', '2021/10/27(水) 24時まで')
      .addField('回答方法', 'このメッセージにリアクション');

    const circles = await prisma.circle.findMany({
      orderBy: { createdAt: 'asc' },
    });
    circles.forEach((circle) => {
      embed.addField(`${circle.name} 希望の場合`, `:${circle.emoji}:`);
    });

    embed.addField(`脱退予定の場合`, `:regional_indicator_d:`);

    embed.addField('未回答の場合', '***除名となります。***');
    embed.addField(
      '回答状態の確認方法',
      '任意のチャンネルで `/month_survey_url` と送信して表示されるURLで確認できます。'
    );

    rest.post(
      `${Routes.webhook(
        '897470834162155560',
        'i76bItNbaecp5Rn1J0vO4jAbb4RVMf32S4ZHWeu1BiAPwq_8X1CtnoHWXlyUg_kcef9G'
      )}?wait=true`,
      {
        body: {
          // content: '@everyone',
          embeds: [embed],
          allowed_mentions: {
            parse: ['everyone'],
          },
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
})();
