import { CircleRole } from '.prisma/client';
import { LinearProgress } from '@mui/material';
import { Box } from '@mui/system';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
  GridToolbar,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import React, { useMemo } from 'react';
import { AdminLayout } from '../../../components/admin_filter';
import {
  Circles,
  getCircleName,
  isLeaveCircle,
  nextMonth,
} from '../../../model';
import {
  Circle,
  MonthCircle,
  MonthCircleAnswerState,
  useAdminMembersQuery,
} from '../../../apollo';
import { prisma } from '../../../database';
import Link from '../../../components/link';

export interface Props {
  monthCircleNames: Array<string>;
}

const MemberList: NextPage<Props> = ({ monthCircleNames }) => {
  const columns: Array<GridColDef> = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'トレーナー名',
        width: 200,
      },
      {
        field: 'circle',
        headerName: 'サークル名',
        width: 200,
        valueFormatter: (params: GridValueFormatterParams) => {
          const circle = params.value as Circle | null;
          return circle?.name;
        },
      },
      {
        field: 'circleRole',
        headerName: '役職',
        width: 200,
        type: 'singleSelect',
        valueOptions: [
          CircleRole.Leader,
          CircleRole.SubLeader,
          CircleRole.Member,
        ],
        valueFormatter: (params: GridValueFormatterParams) => {
          params.value as string;
          switch (params.value) {
            case CircleRole.Leader:
              return 'リーダー';
            case CircleRole.SubLeader:
              return 'サブリーダー';
            default:
              return 'メンバー';
          }
        },
      },
      {
        field: 'trainerId',
        headerName: 'トレーナーID',
        width: 200,
      },
      {
        field: 'nextMonthCircle',
        headerName: '来月のサークル',
        width: 200,
        type: 'singleSelect',
        valueOptions: monthCircleNames,
        valueFormatter: (params: GridValueFormatterParams) => {
          const value = params.value as MonthCircle;
          if (!value || value.circle?.id == Circles.specialIds.noAnswer) {
            return '未回答';
          } else {
            return value.circle ? getCircleName(value.circle) : '';
          }
        },
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as MonthCircle;
          const memberId = params.row.id;
          const { year, month } = nextMonth();
          const href = value
            ? `/month_circles/${value.id}`
            : `/members/${memberId}/month_circles/${year}/${month}`;
          return <Link href={href}>{params.formattedValue}</Link>;
        },
      },
      // {
      //   field: 'actions',
      //   type: 'actions',
      //   getActions: (params: GridRowParams) => {
      //     const actions = [];
      //     const pathname = params.row.pathname;
      //     console.log(params.row);
      //     return [
      //       <GridActionsCellItem
      //         key="members_pathname_url"
      //         component={NextLinkComposed}
      //         to={`/members/path/${pathname}`}
      //         label="基本情報登録ページを開く"
      //         showInMenu
      //       />,
      //     ];
      //   },
      // },
    ],
    [monthCircleNames]
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
        <div style={{ height: 400, width: '100%' }}>
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
          await prisma.circle.findMany({ orderBy: { order: 'asc' } })
        ).map((circle) => circle.name),
      },
    };
  }
};

export default MemberList;
