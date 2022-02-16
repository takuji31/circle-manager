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
import { Circle, Circles, getCircleName } from '../../../model';
import {
  AdminMembersDocument,
  ListedMonthSurveyAnswerFragment,
  MemberStatus,
  MonthCircle,
} from '../../../graphql/generated/type';
import Link, { NextLinkComposed } from '../../../components/link';
import * as Icons from '@mui/icons-material';
import { monthSurveyAnswerLabel } from '../../../model/month_survey_answer';
import { useQuery } from 'urql';
import { memberStatusLabel } from '../../../model/member';

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
        field: 'memberState',
        headerName: '所属/状態',
        width: 200,
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
        field: 'nextMonthSurveyAnswer',
        headerName: '来月の在籍希望',
        width: 200,
        valueFormatter: (params: GridValueFormatterParams) => {
          const value = params.value as ListedMonthSurveyAnswerFragment;
          const answer = value?.value;
          if (!answer) {
            return '対象外';
          } else if (answer == 'None') {
            return '未回答';
          } else {
            return monthSurveyAnswerLabel(answer);
          }
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
          if (!value || value.circle?.id == Circles.specialIds.noAnswer) {
            return '未確定';
          } else {
            return value.circle ? getCircleName(value.circle) : '';
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
        headerName: 'Action',
        getActions: (params: GridRowParams) => {
          const actions = [];
          const pathname = params.row.pathname;
          console.log(params.row);
          return [
            <GridActionsCellItem
              key="members_pathname_url"
              component={NextLinkComposed}
              to={`/members/${pathname}/edit`}
              label="編集"
              icon={<Icons.Edit />}
            />,
          ];
        },
      },
    ],
    [monthCircleNames]
  );

  const [{ data, error, fetching }] = useQuery({ query: AdminMembersDocument });
  const members = data?.members;

  return (
    <AdminLayout title="メンバー一覧">
      {fetching && (
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
            rows={members.map((member) => {
              return {
                ...member,
                memberState: member.circle
                  ? member.circle.name
                  : memberStatusLabel(member.status),
              };
            })}
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
        monthCircleNames: Object.values(Circle).map((circle) => circle.name),
      },
    };
  }
};

export default MemberList;
