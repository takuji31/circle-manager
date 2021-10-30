import {
  Checkbox,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  GetServerSideProps,
  GetStaticPaths,
  GetStaticProps,
  NextPage,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import {
  UpdateMonthCircleMutationInput,
  UpdateMonthCircleMutationVariables,
  useUpdateMonthCircleMutation,
} from '../../../../apollo';
import { PageMonthSurveyComp, ssrMonthSurvey } from '../../../../apollo/page';
import { AdminLayout } from '../../../../components/admin_filter';
import { LoadingCheckBox } from '../../../../components/loading_checkbox';
import { prisma } from '../../../../database';
import { nextMonth, thisMonth } from '../../../../model';

interface MemberWithMonthCircle {
  id: string;
  name: string;
  circle: {
    name: string;
  };
}

interface Props {
  year: string;
  month: string;
  members: Array<MemberWithMonthCircle>;
}

export const MonthCircleList: PageMonthSurveyComp = ({ data }) => {
  const monthSurvey = data?.monthSurvey;
  if (!monthSurvey) {
    return <p>not found</p>;
  }
  return (
    <AdminLayout title={`${monthSurvey.year}年${monthSurvey.month}月の移籍表`}>
      <Stack p={2} spacing={4}>
        <Typography variant="h6">移籍</Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
            <TableCell>移籍先</TableCell>
            <TableCell>トレーナーID</TableCell>
            <TableCell>除名済み</TableCell>
            <TableCell>勧誘済み</TableCell>
            <TableCell>加入済み</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.answers
              .filter(
                (monthCicle) =>
                  monthCicle.state == 'Answered' &&
                  monthCicle.circle?.id != monthCicle.currentCircle.id
              )
              .map((monthCircle) => {
                return (
                  <TableRow key={`answered_${monthCircle.id}`}>
                    <TableCell>{monthCircle.member.name}</TableCell>
                    <TableCell>{monthCircle.currentCircle.name}</TableCell>
                    <TableCell>{monthCircle.circle?.name}</TableCell>
                    <TableCell>{monthCircle.member.trainerId}</TableCell>
                    <TableCell>
                      <MonthCircleStateCheckbox
                        checked={monthCircle.kicked}
                        disabled={monthCircle.kicked && monthCircle.invited}
                        variablesBuilder={(kicked) => ({
                          id: monthCircle.id,
                          kicked,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <MonthCircleStateCheckbox
                        checked={monthCircle.invited}
                        disabled={!monthCircle.kicked || monthCircle.joined}
                        variablesBuilder={(invited) => ({
                          id: monthCircle.id,
                          invited,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <MonthCircleStateCheckbox
                        checked={monthCircle.joined}
                        disabled={!monthCircle.kicked || !monthCircle.invited}
                        variablesBuilder={(joined) => ({
                          id: monthCircle.id,
                          joined,
                        })}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </TableContainer>
        <Typography variant="h6">脱退予定者</Typography>
        <Typography variant="body1">
          Discordからkickするとリストから消えます。先にサークルから除名してください
        </Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.answers
              .filter((monthCicle) => monthCicle.state == 'Retired')
              .map((monthCircle) => {
                return (
                  <TableRow key={`retired_${monthCircle.id}`}>
                    <TableCell>{monthCircle.member.name}</TableCell>
                    <TableCell>{monthCircle.currentCircle.name}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </TableContainer>
        <Typography variant="h6">未回答者(除名)</Typography>
        <Typography variant="body1">
          Discordからkickするとリストから消えます。先にサークルから除名してください
        </Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.answers
              .filter((monthCicle) => monthCicle.state == 'NoAnswer')
              .map((monthCircle) => {
                return (
                  <TableRow key={`no_answer_${monthCircle.id}`}>
                    <TableCell>{monthCircle.member.name}</TableCell>
                    <TableCell>{monthCircle.currentCircle.name}</TableCell>
                  </TableRow>
                );
              })}
            {monthSurvey.noAnswerMembers.map((member) => {
              return (
                <TableRow key={`no_answer_${member.id}`}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.circle?.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      </Stack>
    </AdminLayout>
  );
};

const MonthCircleStateCheckbox = ({
  checked,
  disabled,
  variablesBuilder,
}: {
  checked: boolean;
  disabled?: boolean;
  variablesBuilder: (checked: boolean) => UpdateMonthCircleMutationInput;
}) => {
  const [mutation, { loading }] = useUpdateMonthCircleMutation();
  return (
    <LoadingCheckBox
      checked={checked}
      loading={loading}
      disabled={disabled}
      onCheckChanged={(checked) => {
        mutation({
          variables: {
            data: {
              ...variablesBuilder(checked),
            },
          },
        });
      }}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { year, month } = ctx.params!! as PathParams;
  return await ssrMonthSurvey.getServerPage({ variables: { year, month } });
};

interface PathParams extends ParsedUrlQuery {
  year: string;
  month: string;
}

export default ssrMonthSurvey.withPage((arg) => {
  return {
    variables: {
      year: arg?.query?.year as string,
      month: arg?.query?.month as string,
    },
  };
})(MonthCircleList);
