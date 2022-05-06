import { bucket } from "~/firebase.server";
import type { ActiveCircleKey } from "~/schema/member";
import type { z } from "zod";
import { LocalDate } from "@circle-manager/shared/model";
import { prisma } from "~/db.server";
import { tmpdir } from "os";
import { mkdtemp, writeFile } from "fs/promises";
import path from "path";
import * as os from "os";

interface UploadScreenShotParams {
  screenShotFile: File;
  circleKey: z.infer<typeof ActiveCircleKey>;
  date: LocalDate;
  uploaderId: string;
}

export async function uploadScreenShot({
  screenShotFile,
  circleKey,
  date,
  uploaderId,
}: UploadScreenShotParams) {
  tmpdir();
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

function createCloudStoragePath(
  circleKey: ActiveCircleKey,
  date: LocalDate,
  screenShotId: string
) {
  return `/screenShots/${circleKey}/${date.year()}/${date.monthValue()}/${date.dayOfMonth()}/${screenShotId}.png`;
}
