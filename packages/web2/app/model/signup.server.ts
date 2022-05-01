import { prisma } from "~/db.server";
import { Circles } from "@circle-manager/shared/model";
import {
  sendInvitedMessage,
  setMemberCircleRole,
} from "@circle-manager/shared/discord";

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
