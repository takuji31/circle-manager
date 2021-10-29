import { CircleRole } from '.prisma/client';
import { LinearProgress } from '@mui/material';
import { Box } from '@mui/system';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import React, { useMemo } from 'react';
import { AdminLayout } from '../../../components/admin_filter';
import { thisAndNextMonth } from '../../../model';
import {
  Circle,
  MonthCircle,
  MonthCircleAnswerState,
  useAdminMembersQuery,
} from '../../../apollo';
import { prisma } from '../../../database';
import Link, { NextLinkComposed } from '../../../components/link';

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
        field: 'thisMonthCircle',
        headerName: '今月のサークル',
        width: 200,
        type: 'singleSelect',
        valueOptions: [...monthCircleNames, '未回答', '脱退'],
        valueFormatter: (params: GridValueFormatterParams) => {
          const value = params.value as MonthCircle;
          if (!value || value.state == MonthCircleAnswerState.NoAnswer) {
            return '未回答';
          } else if (value.state == MonthCircleAnswerState.Retired) {
            return '脱退';
          } else {
            return value.circle?.name ?? '';
          }
        },
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as MonthCircle;
          if (!value) {
            return params.formattedValue;
          }
          return (
            <Link href={`/month_circles/${value.id}`}>
              {params.formattedValue}
            </Link>
          );
        },
      },
      {
        field: 'nextMonthCircle',
        headerName: '来月のサークル',
        width: 200,
        type: 'singleSelect',
        valueOptions: monthCircleNames,
        valueFormatter: (params: GridValueFormatterParams) => {
          const value = params.value as MonthCircle;
          if (!value || value.state == MonthCircleAnswerState.NoAnswer) {
            return '未回答';
          } else if (value.state == MonthCircleAnswerState.Retired) {
            return '脱退';
          } else {
            return value.circle?.name ?? '';
          }
        },
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as MonthCircle;
          if (!value) {
            return params.formattedValue;
          }
          return (
            <Link href={`/month_circles/${value.id}`}>
              {params.formattedValue}
            </Link>
          );
        },
      },
      {
        field: 'actions',
        type: 'actions',
        getActions: (params: GridRowParams) => {
          const actions = [];
          const pathname = params.row.pathname;
          console.log(params.row);
          return [
            <GridActionsCellItem
              key="members_pathname_url"
              component={NextLinkComposed}
              to={`/members/path/${pathname}`}
              label="基本情報登録ページを開く"
              showInMenu
            />,
          ];
        },
      },
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
          await prisma.circle.findMany({ orderBy: { createdAt: 'asc' } })
        ).map((circle) => circle.name),
      },
    };
  }
};

export default MemberList;
