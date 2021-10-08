import { CircleRole } from ".prisma/client";
import { LinearProgress } from "@mui/material";
import { Box } from "@mui/system";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import React, { useMemo } from "react";
import { AdminLayout } from "../../../components/admin_filter";
import { thisAndNextMonth } from "../../../date/year_month";
import {
  Circle,
  MonthCircle,
  MonthCircleAnswerState,
  useAdminMembersQuery,
} from "../../../generated/graphql";
import prisma from "../../../prisma";

export interface Props {
  monthCircleNames: Array<string>;
}

const MemberList: NextPage<Props> = ({ monthCircleNames }) => {
  const columns: Array<GridColDef> = useMemo(
    () => [
      {
        field: "name",
        headerName: "トレーナー名",
        width: 200,
      },
      {
        field: "circle",
        headerName: "サークル名",
        width: 200,
        valueFormatter: (params: GridValueFormatterParams) => {
          const circle = params.value as Circle | null;
          return circle?.name;
        },
      },
      {
        field: "circleRole",
        headerName: "役職",
        width: 200,
        type: "singleSelect",
        valueOptions: [
          CircleRole.Leader,
          CircleRole.SubLeader,
          CircleRole.Member,
        ],
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
        type: "singleSelect",
        valueOptions: [...monthCircleNames, "未回答", "脱退"],
        valueFormatter: (params: GridValueFormatterParams) => {
          const value = params.value as MonthCircle;
          if (!value || value.state == MonthCircleAnswerState.NoAnswer) {
            return "未回答";
          } else if (value.state == MonthCircleAnswerState.Retired) {
            return "脱退";
          } else {
            return value.circle?.name ?? "";
          }
        },
      },
      {
        field: "nextMonthCircle",
        headerName: "来月のサークル",
        width: 200,
        type: "singleSelect",
        valueOptions: monthCircleNames,
        valueFormatter: (params: GridValueFormatterParams) => {
          const value = params.value as MonthCircle;
          if (!value || value.state == MonthCircleAnswerState.NoAnswer) {
            return "未回答";
          } else if (value.state == MonthCircleAnswerState.Retired) {
            return "脱退";
          } else {
            return value.circle?.name ?? "";
          }
        },
      },
      // {
      //   field: "actions",
      //   type: "actions",
      //   getActions: (params: GridRowParams) => {
      //     const actions = [];
      //     return [
      //       <GridActionsCellItem
      //         onClick={() => {}}
      //         label="Delete"
      //         showInMenu
      //       />,
      //       <GridActionsCellItem
      //         onClick={() => {}}
      //         label="Delete"
      //         showInMenu
      //       />,
      //       <GridActionsCellItem
      //         onClick={() => {}}
      //         label="Delete"
      //         showInMenu
      //       />,
      //       <GridActionsCellItem
      //         onClick={() => {}}
      //         label="Delete"
      //         showInMenu
      //       />,
      //       <GridActionsCellItem
      //         onClick={() => {}}
      //         label="Delete"
      //         showInMenu
      //       />,
      //     ];
      //   },
      // },
    ],
    monthCircleNames
  );

  const { data, error, loading } = useAdminMembersQuery();
  const members = data?.members as GridRowsProp;

  return (
    <AdminLayout title="メンバー一覧">
      {loading && (
        <Box>
          <LinearProgress />
        </Box>
      )}
      {error && <p>エラーが起きました {error.message}</p>}
      {members && (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            components={{
              Toolbar: GridToolbar,
            }}
            autoHeight
            rows={members}
            columns={columns}
          />
        </div>
      )}
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
        monthCircleNames: [],
      },
    };
  } else {
    return {
      props: {
        monthCircleNames: await (
          await prisma.circle.findMany({ orderBy: { createdAt: "asc" } })
        ).map((circle) => circle.name),
      },
    };
  }
};

export default MemberList;
