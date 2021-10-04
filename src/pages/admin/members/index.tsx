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
  thisMonthCircle: string | null;
  nextMonthCircle: string | null;
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
    field: "thisMonthCircle",
    headerName: "今月のサークル",
    width: 200,
    renderCell: (params: GridRenderCellParams) => {
      const value = params.value as string;
      const memberId = params.row.id;
      return (
        <>
          {value ? (
            value
          ) : (
            <Button
              component={NextLinkComposed}
              to={`/members/${memberId}/month_circles/2021/11`}
            >
              リマインド
            </Button>
          )}
        </>
      );
    },
  },
  {
    field: "nextMonthCircle",
    headerName: "来月のサークル",
    width: 200,
    renderCell: (params: GridRenderCellParams) => {
      const value = params.value as string;
      return <>{value ? value : <Button>リマインド</Button>}</>;
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
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const nextYear = month == 12 ? year + 1 : year;
    const nextMonth = month == 12 ? 1 : month + 1;
    const members = await prisma.member.findMany({
      include: {
        circle: true,
        monthCircles: {
          where: {
            OR: [
              {
                year: year.toString(),
                month: month.toString(),
              },
              {
                year: nextYear.toString(),
                month: nextMonth.toString(),
              },
            ],
          },
          include: {
            circle: true,
          },
        },
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
            thisMonthCircle:
              member.monthCircles.find((monthCircle) => {
                return (
                  monthCircle.year == year.toString() &&
                  monthCircle.month == month.toString()
                );
              })?.circle?.name ?? null,
            nextMonthCircle:
              member.monthCircles.find((monthCircle) => {
                return (
                  monthCircle.year == nextYear.toString() &&
                  monthCircle.month == nextMonth.toString()
                );
              })?.circle?.name ?? null,
          };
        }),
      },
    };
  }
};

export default MemberList;
