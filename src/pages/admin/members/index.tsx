import { CircleRole } from ".prisma/client";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import { AdminLayout } from "../../../components/admin_filter";
import { NextLinkComposed } from "../../../components/link2";
import useUser from "../../../hooks/user";
import { prisma } from "../../../prisma";

interface Member {
  id: string;
  name: string;
  circleName: string;
  role: CircleRole;
}

export interface Props {
  members?: Array<Member>;
}

const columns: Array<GridColDef> = [
  {
    field: "name",
    headerName: "トレーナー名",
    width: 200,
  },
  {
    field: "circleName",
    headerName: "サークル名",
    width: 200,
  },
  {
    field: "role",
    headerName: "役職",
    width: 200,
    type: "singleSelect",
    valueOptions: [CircleRole.Leader, CircleRole.SubLeader, CircleRole.Member],
    valueFormatter: (params: GridValueFormatterParams) => {
      params.value as string;
      switch (params.value) {
        case CircleRole.Leader:
          return "リーダー";
        case CircleRole.SubLeader:
          return "サブリーダー";
        default:
          return "メンバー";
      }
    },
  },
  {
    field: "id",
    headerName: "action",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <Button component={NextLinkComposed} to={`/members/${params.value}`}>
          Action
        </Button>
      );
    },
  },
];

const MemberList: NextPage<Props> = ({ members }) => {
  return (
    <AdminLayout title="メンバー一覧">
      <div style={{ height: 400, width: "100%" }}>
        {members && (
          <DataGrid
            components={{
              Toolbar: GridToolbar,
            }}
            autoHeight
            rows={members}
            columns={columns}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context);
  if (session?.isAdmin != true) {
    return {
      props: {
        members: [],
      },
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
            id: member.id,
            name: member.name,
            circleName:
              member.circle?.name ?? (member.leavedAt ? "脱退済" : "未所属"),
            role: member.circleRole,
          };
        }),
      },
    };
  }
};

export default MemberList;
