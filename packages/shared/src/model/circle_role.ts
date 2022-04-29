import { CircleRole } from "@prisma/client";

export const circleRoleLabel = (role: CircleRole) => {
  switch (role) {
    case CircleRole.Leader:
      return "リーダー";
    case CircleRole.SubLeader:
      return "サブリーダー";
    default:
      return "メンバー";
  }
};
