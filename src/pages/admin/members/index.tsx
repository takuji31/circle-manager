import { CircleRole } from ".prisma/client";
import { List, ListItem, ListItemText } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { AdminLayout } from "../../../components/admin_filter";
import useUser from "../../../hooks/user";
import { prisma } from "../../../prisma";

interface Member {
  name: string;
  circleName: string;
  role: CircleRole;
}

export interface Props {
  members?: Array<Member>;
}

const MemberList: NextPage<Props> = ({ members }) => {
  return (
    <AdminLayout title="メンバー一覧">
      <List>
        {members?.map((member) => {
          return (
            <ListItem>
              <ListItemText>{member.name}</ListItemText>
            </ListItem>
          );
        })}
      </List>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);
  if (session?.isAdmin != true) {
    return {
      props: {},
    };
  } else {
    const members = await prisma.member.findMany({
      include: {
        circle: true,
      },
      orderBy: [
        {
          circle: {
            createdAt: "asc",
          },
        },
        {
          circleRole: "asc",
        },
        {
          joinedAt: "asc",
        },
      ],
    });
    return {
      props: {
        members: members.map((member) => {
          return {
            name: member.name,
            circleName:
              member.circle?.name ?? member.leavedAt ? "脱退済" : "未所属",
          };
        }),
      },
    };
  }
};

export default MemberList;
