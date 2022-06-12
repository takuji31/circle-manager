import { LocalDate } from "@/model";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { google } from "@google-cloud/vision/build/protos/protos";
import type { CircleKey, ScreenShot as PrismaScreenShot } from "@prisma/client";
import { CircleRole, MemberFanCountSource } from "@prisma/client";
import _, { isEqual } from "lodash";
import type { z } from "zod";
import { prisma } from "~/db.server";
import { bucket } from "~/firebase.server";
import { logger } from "~/lib/logger";
import type { ActiveCircleKey } from "~/schema/member";
import { parseMemberNameAndFanCount } from "./member_fan_count.server";
import IAnnotateImageResponse = google.cloud.vision.v1.IAnnotateImageResponse;

interface UploadScreenShotParams {
  paths: Array<string>;
  circleKey: z.infer<typeof ActiveCircleKey>;
  date: LocalDate;
  uploaderId: string;
}

interface ParseScreenShotParams {
  circleKey: z.infer<typeof ActiveCircleKey>;
  date: LocalDate;
}

interface Paragraph {
  words: Array<string>;
  boundingBox: BoundingBox;
}

interface ParsedParagraph<T = any> {
  value: T;
  boundingBox: BoundingBox;
}

class BoundingBox {
  constructor(public left: number, public top: number, public right: number, public bottom: number) {
  }

  maybeSameLine(other: BoundingBox): boolean {
    const [a, b] = _.sortBy([this, other], "top");
    return a.bottom >= b.top;
  }
}

export type ScreenShot = Awaited<ReturnType<typeof getScreenShots>>;
export type ScreenShotMemberFanCount = ScreenShot[0]["fanCounts"][0];

export async function getScreenShots({
  date,
  circleKey,
}: {
  date: LocalDate;
  circleKey: ActiveCircleKey;
}) {
  return await prisma.screenShot
    .findMany({
      where: { date: date.toUTCDate(), circleKey },
      include: {
        fanCounts: {
          include: {
            member: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })
    .then((screenShots) =>
      screenShots.map((ss) => {
        const { fanCounts, ...screenShot } = ss;
        return {
          ...screenShot,
          fanCounts: fanCounts.map((c) => {
            const { total, monthlyTotal, monthlyAvg, ...member } = c;
            return {
              ...member,
              total: parseInt(total.toString()),
              monthlyTotal: monthlyTotal
                ? parseInt(monthlyTotal.toString())
                : null,
              monthlyAvg: monthlyAvg ? parseInt(monthlyAvg.toString()) : null,
            };
          }),
        };
      }),
    );
}

export async function uploadScreenShots({
  paths,
  circleKey,
  date,
  uploaderId,
}: UploadScreenShotParams) {

  const transactions = [];
  for (const path of paths) {
    const ref = await bucket.file(path);
    if (!await ref.exists()) {
      throw new Error(`ファイルが見つかりませんでした ${ref.name}`);
    }
    await ref.makePublic();
    transactions.push(prisma.screenShot.create({
      data: {
        date: date.toUTCDate(),
        circleKey,
        uploaderId,
        storagePath: path,
        url: ref.publicUrl(),
      },
    }));

  }

  return await prisma.$transaction(transactions);
}

export async function deleteScreenShot({ id }: { id: string }) {
  const screenShot = await prisma.screenShot.findFirst({ where: { id } });
  if (!screenShot) {
    throw new Error(`ScreenShot ${id} not found`);
  }
  const file = await bucket.file(screenShot.storagePath ??
    createCloudStoragePath(
      screenShot.circleKey as ActiveCircleKey,
      LocalDate.fromUTCDate(screenShot.date),
      screenShot.id,
    ),
  );
  await file.delete({ ignoreNotFound: true });
  await prisma.screenShot.delete({ where: { id: screenShot.id } });
  return { success: true };
}

export async function setMemberIdToMemberFanCount({
  memberId,
  memberFanCountId,
}: {
  memberId: string;
  memberFanCountId: string;
}) {
  const memberFanCount = await prisma.memberFanCount.findFirst({
    where: { id: memberFanCountId },
  });

  if (!memberFanCount) {
    throw new Error(`Unknown Member Fan Count ID ${memberFanCountId}`);
  }

  const member = await prisma.member.findFirst({ where: { id: memberId } });

  if (!member) {
    throw new Error(`Unknown Member ID ${memberId}`);
  }

  await prisma.memberFanCount.update({
    where: { id: memberFanCountId },
    data: { memberId },
  });
}

export function cloudStoragePathPrefix(
  circleKey: CircleKey,
  date: LocalDate,
) {
  const prefix =
    !process.env.FIREBASE_STORAGE_EMULATOR_HOST &&
    process.env.NODE_ENV == "development"
      ? "development/"
      : "";
  return `${prefix}screenShots/${circleKey}/${date.year()}/${date.monthValue()}/${date.dayOfMonth()}/`;
}

function createCloudStoragePath(
  circleKey: CircleKey,
  date: LocalDate,
  screenShotId: string,
) {

  return `${cloudStoragePathPrefix(circleKey, date)}${screenShotId}.png`;
}

export async function parseScreenShots({
  circleKey,
  date,
}: ParseScreenShotParams) {
  const screenShots = await prisma.screenShot.findMany({
    where: { date: date.toUTCDate(), circleKey },
    orderBy: {
      createdAt: "asc",
    },
  });
  // const idx = 9;
  return await Promise.all(
    screenShots
      // .slice(idx, idx + 1)
      .map(screenShot => {
        return parseScreenShot({
          screenShot,
          circleKey,
          date,
        });
      }),
  );
}

type Member = {
  name: string;
  role: CircleRole;
  fanCount: number;
};

const memberNameNoiseRegex = /(\(0|O?\(\)?|\(?i\)?|0|[①ⓘ]+i?|○|O)$/;
const fanCountValueRegex = /[0-9,]+/;

function findMemberRoles(paragraphs: Array<Paragraph>, memberFanCounts: ParsedParagraph<number>[]): Array<ParsedParagraph<CircleRole>> {
  const sortedParagraphs = _.chain(paragraphs).sortBy(m => -m.boundingBox.top).value();
  return _.chain(memberFanCounts)
    .sortBy(m => m.boundingBox.top)
    .value()
    .map((memberFanCount, index, array) => {
      const candidateParagraphs = _.chain(index == 0 ? sortedParagraphs.filter(p => p.boundingBox.bottom < memberFanCount.boundingBox.top) : (() => {
        const previousMemberFanCount = array[index - 1];
        return sortedParagraphs.filter(p => !p.boundingBox.maybeSameLine(previousMemberFanCount.boundingBox) && p.boundingBox.top > previousMemberFanCount.boundingBox.bottom && p.boundingBox.bottom < memberFanCount.boundingBox.top);
      })())
        .sortBy(p => -p.boundingBox.top)
        .value();
      for (const { words, boundingBox } of candidateParagraphs) {
        const firstWord = words[0];
        if ((
            words.length >= 1 && (firstWord == "リーダー" || firstWord == "メンバー")) ||
          (words.length >= 2 && isEqual(words.slice(0, 2), ["サブ", "リーダー"]))
        ) {
          return {
            value: firstWord == "リーダー" ? CircleRole.Leader : firstWord == "メンバー" ? CircleRole.Member : CircleRole.SubLeader,
            boundingBox: boundingBox,
          };
        }
      }
      throw new Error(`総獲得ファン数 ${memberFanCount.value} のメンバー名を発見できませんでした。`);
    });
}

function findMemberNames(paragraphs: Array<Paragraph>, roles: Array<ParsedParagraph<CircleRole>>): Array<ParsedParagraph<string>> {
  return roles.map((role) => {

    // たまにロールとトレーナー名が同じ段落になるので、その場合はトレーナー名検出を行わずにロールとノイズだけ削除した値をトレーナー名とする
    const roleParagraph = paragraphs.filter(p => isEqual(p.boundingBox, role.boundingBox))[0];
    const memberIncludePattern1 = roleParagraph.words.length > 1 && ["リーダー", "メンバー"].includes(roleParagraph.words[0]);
    const memberIncludePattern2 = roleParagraph.words.length > 2 && isEqual(roleParagraph.words.slice(0, 2), ["サブ", "リーダー"]);
    if (memberIncludePattern1 || memberIncludePattern2) {
      const words = memberIncludePattern1 ? roleParagraph.words.slice(1) : roleParagraph.words.slice(2);
      return {
        value: words.join("").replace(memberNameNoiseRegex, ""),
        boundingBox: roleParagraph.boundingBox,
      };
    }
    const sameLineParagraphs = _.chain(paragraphs)
      .filter(p => p.boundingBox.maybeSameLine(role.boundingBox))
      .filter(p => !isEqual(p.boundingBox, role.boundingBox))
      .sortBy(p => p.boundingBox.left).value();
    if (!sameLineParagraphs.length) {
      throw new Error(`役職からメンバー名を発見できませんでした。位置： ${role.boundingBox}`);
    }
    logger.debug(`Trainer name candidate paragraphs %o`, sameLineParagraphs);
    const { boundingBox, words } = sameLineParagraphs[0];
    return {
      value: words.join("").replace(memberNameNoiseRegex, ""),
      boundingBox,
    };
  });
}

// たまに,が.と認識されてしまうことがある。総獲得ファン数は必ず整数なので.を,としても問題ない
const totalFanCountSeparatorRegex = /[,.]/g;

function findMemberFanCounts(paragraphs: Array<Paragraph>): Array<ParsedParagraph<number>> {
  const memberFanCounts: Array<ParsedParagraph<number>> = [];
  for (const { words, boundingBox } of paragraphs) {
    const paragraphText = words.join("");
    if (words.length >= 2 && words[0].match(fanCountValueRegex) && words[1] == "人") {
      logger.debug("Maybe fanCounts %o", words);
      const value = parseInt(words[0].replaceAll(totalFanCountSeparatorRegex, ""));
      memberFanCounts.push({ value, boundingBox });
    } else if (words.length >= 6 && paragraphText.startsWith("総獲得ファン数") && words[4].match(fanCountValueRegex) && words[5] == "人" && !paragraphText.match(memberNameNoiseRegex)) {
      logger.debug("Maybe fanCounts with label %o", words);
      const value = parseInt(words[4].replaceAll(totalFanCountSeparatorRegex, ""));
      memberFanCounts.push({ value, boundingBox });
    }
  }
  return memberFanCounts;
}

function parseAnnotateImageResult(paragraphs: Array<Paragraph>) {
  logger.debug("paragraphs: %o", paragraphs);
  const memberFanCounts: Array<ParsedParagraph<number>> = findMemberFanCounts(paragraphs);
  const memberRoles: Array<ParsedParagraph<CircleRole>> = findMemberRoles(paragraphs, memberFanCounts);
  const memberNames: Array<ParsedParagraph<string>> = findMemberNames(paragraphs, memberRoles);

  logger.debug("memberRoles: %o, memberNames: %o, memberFanCounts: %o", memberRoles, memberNames, memberFanCounts);

  if (memberRoles.length != memberNames.length || memberRoles.length != memberFanCounts.length) {
    throw new Error(`抽出できたテキストの数が一致しません(ロール:${memberRoles.length} / トレーナー名:${memberNames.length} / 総獲得ファン数:${memberFanCounts.length})`);
  }

  return _.zip(memberRoles, memberNames, memberFanCounts).map<Member>(([role, name, fanCount]) => {
    return {
      role: role!.value,
      name: name!.value,
      fanCount: fanCount!.value,
    } as Member;
  });
}

const parseScreenShot = async ({
  screenShot,
  circleKey,
  date,
}: {
  screenShot: PrismaScreenShot;
  circleKey: ActiveCircleKey;
  date: LocalDate;
}) => {
  const file = await bucket.file(
    screenShot.storagePath ?? createCloudStoragePath(
      screenShot.circleKey,
      LocalDate.fromUTCDate(screenShot.date),
      screenShot.id,
    ),
  );
  if (!(await file.exists())) {
    throw new Error(`ScreenShot ${screenShot.id} not uploaded in ${file.name}`);
  }

  const client = new ImageAnnotatorClient({});

  // ユニット数節約のために一度パースしたスクリーンショットは再度Cloud Vision APIに投げない
  const result: IAnnotateImageResponse = screenShot.rawJson as IAnnotateImageResponse | null ?? (await client.annotateImage(
    {
      image: {
        source: {
          imageUri: `gs://${file.bucket.name}/${file.name}`,
        },
      },
      "features": [
        {
          "type": "DOCUMENT_TEXT_DETECTION",
        },
      ],
      "imageContext": {
        "languageHints": ["ja"],
      },
    } as any,
  ))[0];
  const annotations = result.fullTextAnnotation;
  const page = annotations?.pages?.at(0);

  if (!page || !page.blocks) {
    throw new Error(`Page not found ${result.error?.message}`);
  }

  const paragraphs =
    _.chain(page.blocks)
      .orderBy(block => block.boundingBox?.vertices?.[0]?.y, "asc")
      .flatMap(block => {
        if (block.blockType != "TEXT") {
          return [];
        }
        return block?.paragraphs ?? [];
      })
      .sortBy(paragraph => paragraph?.boundingBox?.vertices?.[0]?.x ?? 0)
      .sortBy(paragraph => paragraph?.boundingBox?.vertices?.[0]?.y ?? 0)
      .value()
      .map((paragraph) => {
          const words = paragraph.words?.flatMap((word) => {
              return word.symbols?.map((symbol) => symbol.text).join("") ?? "";
            },
          ) ?? [];

          const vertices = paragraph.boundingBox!.vertices!;

          const boundingBox = new BoundingBox(
            _.min(vertices.map(v => v.x)) ?? 0,
            _.min(vertices.map(v => v.y)) ?? 0,
            _.max(vertices.map(v => v.x)) ?? 0,
            _.max(vertices.map(v => v.y)) ?? 0,
          );
          return { words, boundingBox };
        },
      );

  const members = parseAnnotateImageResult(paragraphs);

  await prisma.screenShot.update({
    where: { id: screenShot.id },
    data: {
      rawJson: result as any,
      fanCounts: {
        deleteMany: { screenShotId: screenShot.id },
      },
    },
  });

  return await parseMemberNameAndFanCount({
    circleKey,
    date,
    memberAndFanCounts: members.map((m, order) => [m.name, m.fanCount]),
    source: {
      type: MemberFanCountSource.ScreenShot,
      screenShotId: screenShot.id,
    },
  }).then(list => list.map(({ monthlyTotal, monthlyAvg, total, ...m }) => {
    return {
      m,
      monthlyTotal: monthlyTotal ? parseInt(monthlyTotal.toString()) : null,
      monthlyAvg: monthlyAvg ? parseInt(monthlyAvg.toString()) : null,
      total: total ? parseInt(total.toString()) : null,
    };
  }));
};
