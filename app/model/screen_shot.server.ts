import { bucket } from "~/firebase.server";
import type { ActiveCircleKey } from "~/schema/member";
import type { z } from "zod";
import { LocalDate } from "@/model";
import { prisma } from "~/db.server";
import * as os from "os";
import { mkdtemp, writeFile } from "fs/promises";
import path from "path";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import type { CircleKey, ScreenShot as PrismaScreenShot } from "@prisma/client";
import { MemberFanCountSource } from "@prisma/client";
import { CircleRole } from "@prisma/client";
import { parseMemberNameAndFanCount } from "./member_fan_count.server";

interface UploadScreenShotParams {
  screenShotFile: File;
  circleKey: z.infer<typeof ActiveCircleKey>;
  date: LocalDate;
  uploaderId: string;
}

interface ParseScreenShotParams {
  circleKey: z.infer<typeof ActiveCircleKey>;
  date: LocalDate;
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
        updatedAt: "asc",
      },
    })
    .then((screenShots) =>
      screenShots.map((ss) => {
        const { fanCounts, ...screenShot } = ss;
        return {
          ...screenShot,
          fanCounts: fanCounts.map((c) => {
            const { total, monthlyTotal, ...member } = c;
            return {
              ...member,
              total: parseInt(total.toString()),
              monthlyTotal: parseInt(monthlyTotal.toString()),
            };
          }),
        };
      })
    );
}

export async function uploadScreenShot({
  screenShotFile,
  circleKey,
  date,
  uploaderId,
}: UploadScreenShotParams) {
  const screenShot = await prisma.screenShot.create({
    data: {
      date: date.toUTCDate(),
      circleKey,
      uploaderId,
      url: null,
    },
  });
  const screenShotId = screenShot.id;
  try {
    // Remixから受け取れるファイルのパスをどう頑張っても取れないので一旦別のファイルに書き出してからアップロード
    const dir = await mkdtemp(
      path.join(os.tmpdir(), "circle-manager-screenshot-")
    );
    const filePath = path.join(dir, `${screenShotId}.png`);
    await writeFile(filePath, screenShotFile.stream());
    const response = await bucket.upload(filePath, {
      public: true,
      destination: createCloudStoragePath(circleKey, date, screenShotId),
    });
    const createdFile = response[0];
    await prisma.screenShot.update({
      where: { id: screenShotId },
      data: { url: createdFile.publicUrl() },
    });
  } catch (e) {
    console.log("Upload error %s", e);
    await prisma.screenShot.delete({ where: { id: screenShotId } });
  }
  return await prisma.screenShot.findFirst({ where: { id: screenShotId } })!;
}

export async function deleteScreenShot({ id }: { id: string }) {
  const screenShot = await prisma.screenShot.findFirst({ where: { id } });
  if (!screenShot) {
    throw new Error(`ScreenShot ${id} not found`);
  }
  const file = await bucket.file(
    createCloudStoragePath(
      screenShot.circleKey as ActiveCircleKey,
      LocalDate.fromUTCDate(screenShot.date),
      screenShot.id
    )
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

function createCloudStoragePath(
  circleKey: CircleKey,
  date: LocalDate,
  screenShotId: string
) {
  const prefix =
    !process.env.FIREBASE_STORAGE_EMULATOR_HOST &&
    process.env.NODE_ENV == "development"
      ? "development/"
      : "";
  return `${prefix}screenShots/${circleKey}/${date.year()}/${date.monthValue()}/${date.dayOfMonth()}/${screenShotId}.png`;
}

export async function parseScreenShots({
  circleKey,
  date,
}: ParseScreenShotParams) {
  const screenShots = await prisma.screenShot.findMany({
    where: { date: date.toUTCDate(), circleKey },
  });
  for (const screenShot of screenShots) {
    await parseScreenShot({
      screenShot,
      circleKey,
      date,
    });
  }
}

type Member = {
  name: string;
  role: CircleRole;
  fanCount: number;
};

const roleRegex = /^((サブ)?リーダー|メンバー)/;
const memberNameNoiseRegex = /(\(0|O?\(\)?|\(?i\)?|0|①|○|O)$/;
const fanCountRegex = /^総獲得ファン数([0-9,]+)人/;

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
    createCloudStoragePath(
      screenShot.circleKey,
      LocalDate.fromUTCDate(screenShot.date),
      screenShot.id
    )
  );
  if (!(await file.exists())) {
    throw new Error(`ScreenShot ${screenShot.id} not uploaded in ${file.name}`);
  }

  const client = new ImageAnnotatorClient();

  // TODO: ユニット数節約のために一度パースしたスクリーンショットは再度Cloud Vision APIに投げない
  const [result] = await client.documentTextDetection(
    `gs://${file.bucket.name}/${file.name}`
  );
  const annotations = result.fullTextAnnotation;

  const page = annotations?.pages?.at(0);

  if (!page || !page.blocks) {
    throw new Error(`Page not found ${result.error?.message}`);
  }

  const members: Array<Member> = [];
  let currentMember: Partial<Member> | null = null;
  let memberNotFound: boolean = false;
  for (let block of page.blocks) {
    if (block.blockType != "TEXT") continue;
    if (!block.paragraphs) continue;
    const text = block.paragraphs
      .flatMap((paragraph) =>
        paragraph.words?.flatMap((word) =>
          word.symbols?.flatMap((symbol) => symbol.text)
        )
      )
      .join("");
    // console.log("Text %s", text);

    // ロールの次のブロックはほぼ間違いなくメンバー名
    if (memberNotFound && currentMember) {
      const memberName = text.replace(memberNameNoiseRegex, "");
      // console.log("Maybe member name %s", memberName);
      currentMember.name = memberName;
      memberNotFound = false;
    } else if (currentMember && text.match(fanCountRegex)) {
      const [, fanCountString] = text.match(fanCountRegex)!;
      // console.log("Found fan count %s", fanCountString);
      if (fanCountString) {
        currentMember.fanCount = parseInt(fanCountString.replaceAll(",", ""));
        members.push(currentMember as Member);
      }
    }
    if (text.match(roleRegex) && !text.match("30加入方針")) {
      // reset member
      memberNotFound = false;
      currentMember = {
        name: text.replace(roleRegex, "").replace(memberNameNoiseRegex, ""),
        role: text.startsWith("リーダー")
          ? CircleRole.Leader
          : text.startsWith("サブリーダー")
          ? CircleRole.SubLeader
          : CircleRole.Member,
      };
      if (!currentMember.name) {
        memberNotFound = true;
        // console.log("Find role row. but member name not found");
        // } else {
        // console.log("maybe member block %s, member: %s", text, currentMember);
      }
    }
  }

  await prisma.screenShot.update({
    where: { id: screenShot.id },
    data: {
      rawJson: result as any,
      fanCounts: {
        deleteMany: { screenShotId: screenShot.id },
      },
    },
  });

  await parseMemberNameAndFanCount({
    circleKey,
    date,
    memberAndFanCounts: members.map((m, order) => [m.name, m.fanCount]),
    source: {
      type: MemberFanCountSource.ScreenShot,
      screenShotId: screenShot.id,
    },
  });
};
