import {
  createDiscordRestClient,
  sendAdminNotificationMessage,
  sendInvitedMessage,
  setMemberCircleRole,
} from "@/discord";
import type { SessionUser } from "@/model";
import { Circles, DateFormats, Guild } from "@/model";
import { ZonedDateTime } from "@js-joda/core";
import { CircleRole, MemberStatus } from "@prisma/client";
import type { RESTPutAPIGuildMemberJSONBody } from "discord-api-types/rest/v9";
import { Routes } from "discord-api-types/rest/v9";
import { prisma } from "~/db.server";
import type { ActiveCircleKey } from "~/schema/member";

export const getNotJoinedSignUps = ({ invited }: { invited?: boolean }) => {
  return prisma.signUp
    .findMany({
      where: { joined: false, invited, member: { leavedAt: null } },
      include: { member: true },
      orderBy: {
        createdAt: "asc",
      },
    })
    .then((signUps) =>
      signUps.map((signUp) => ({
        circle: signUp.circleKey
          ? Circles.findByCircleKey(signUp.circleKey)
          : null,
        ...signUp,
      }))
    );
};

const findSignUpMemberById = async (memberId: string) => {
  const signUp = await prisma.signUp.findFirst({
    where: { id: memberId },
    include: { member: true },
  });
  if (!signUp) {
    throw new Error(`Member ${memberId} not found`);
  }
  if (!signUp.circleKey) {
    throw new Error(`Circle not selected for member ${memberId}`);
  }
  const circle = Circles.findByCircleKey(signUp.circleKey);
  return { ...signUp, circle };
};

export const inviteMember = async ({ memberId }: { memberId: string }) => {
  const signUp = await findSignUpMemberById(memberId);
  try {
    await sendInvitedMessage(signUp.member, signUp.circle, "signUp");
  } catch (e) {
    console.log(e);
  }
  return prisma.signUp.update({
    where: { id: memberId },
    data: { invited: true },
  });
};

export const joinMember = async ({ memberId }: { memberId: string }) => {
  const { circle } = await findSignUpMemberById(memberId);
  try {
    await setMemberCircleRole(memberId, circle.id);
  } catch (e) {
    console.log(e);
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { circleKey: circle.key },
  });
  return prisma.signUp.update({
    where: { id: memberId },
    data: { joined: true },
  });
};

export const updateMemberSignUpCircle = async ({
  memberId,
  circleKey,
}: {
  memberId: string;
  circleKey: ActiveCircleKey;
}) => {
  const member = await prisma.member.findFirst({ where: { id: memberId } });
  if (!member) {
    throw new Error(`Unknown member id ${memberId}`);
  }
  await prisma.signUp.upsert({
    where: { id: member.id },
    create: { id: member.id, circleKey },
    update: { circleKey },
  });
  if (!member.setupCompleted) {
    // TODO: setup
    const circle = Circles.findByCircleKey(circleKey);
    await sendAdminNotificationMessage(
      `<@&${circle.id}> <@!${memberId}>さんから加入申請が送られました。 ${process.env.BASE_URL}/admin/signups`
    );
  }
  await prisma.member.update({
    where: { id: member.id },
    data: { setupCompleted: true },
  });
};

export async function createSignUpUrl({
  circleKey,
  memo,
  creatorId,
}: {
  circleKey: ActiveCircleKey;
  memo: string;
  creatorId: string;
}) {
  return await prisma.signUpUrl.create({
    data: {
      circleKey,
      memo,
      creatorId,
    },
  });
}

export async function getSignUpUrls() {
  return await prisma.signUpUrl
    .findMany({
      include: { creator: true },
      orderBy: [{ createdAt: "desc" }],
    })
    .then((list) =>
      list.map(({ circleKey, createdAt, ...s }) => {
        return {
          ...s,
          circleKey,
          circle: Circles.findByCircleKey(circleKey),
          createdAt,
          createdAtString: ZonedDateTime.fromDate(createdAt).format(
            DateFormats.dateTime
          ),
          permalink: `${process.env.BASE_URL}/sign_up_urls/${s.id}/`,
        };
      })
    );
}

export async function setNameToSignUpUrl({
  signUpUrlId,
  trainerName,
}: {
  signUpUrlId: string;
  trainerName: string;
}) {
  const updated = await prisma.signUpUrl.update({
    where: { id: signUpUrlId },
    data: {
      name: trainerName,
    },
  });
  if (!updated) {
    throw new Error(`Unknown sign up url ${signUpUrlId}`);
  }
}

export async function completeSignUp({
  signUpUrlId,
  trainerId,
  user,
}: {
  signUpUrlId: string;
  trainerId: string;
  user: SessionUser;
}) {
  const signUpUrl = await prisma.signUpUrl.findUnique({
    where: { id: signUpUrlId },
    rejectOnNotFound: true,
  });
  if (signUpUrl.memberId != null) {
    return;
  }
  if (signUpUrl.name == null) {
    throw new Error("加入申請に必要な情報の入力が完了していません。");
  }
  const rest = createDiscordRestClient();
  const body: RESTPutAPIGuildMemberJSONBody = {
    nick: signUpUrl.name ?? user.name,
    access_token: user.accessToken,
  };
  console.log(body);
  await rest.put(Routes.guildMember(Guild.id, user.id), { body });

  await prisma.member.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      name: signUpUrl.name,
      trainerId,
      status: MemberStatus.NotJoined,
      circleRole: CircleRole.Member,
      setupCompleted: true,
      signUp: {
        create: {
          circleKey: signUpUrl.circleKey,
        },
      },
      joinedAt: new Date(),
    },
    update: {
      signUp: {
        delete: true,
        create: {
          circleKey: signUpUrl.circleKey,
        },
      },
    },
  });

  await prisma.signUpUrl.update({ where: { id: signUpUrlId }, data: { member: { connect: { id: user.id } } } })
}
