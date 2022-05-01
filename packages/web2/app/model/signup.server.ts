import { prisma } from "~/db.server";
import { Circles } from "@circle-manager/shared/model";
import { sendInvitedMessage } from "@circle-manager/shared/discord";

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

export const inviteMember = async ({ memberId }: { memberId: string }) => {
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
  try {
    const circle = Circles.findByCircleKey(signUp.circleKey);
    await sendInvitedMessage(signUp.member, circle, "signUp");
  } catch (e) {
    console.log(e);
  }
  return prisma.signUp.update({
    where: { id: memberId },
    data: { invited: true },
  });
};
