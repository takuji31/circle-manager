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
import { NextPage } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import {
  MonthCircleState,
  MonthSurveyDocument,
  UpdateMonthCircleDocument,
  UpdateMonthCircleMutationInput,
} from '../../../../graphql/generated/type';
import { AdminLayout } from '../../../../components/admin_filter';
import { LoadingCheckBox } from '../../../../components/loading_checkbox';
import { useMutation, useQuery } from 'urql';
import {
  getServerSidePropsWithUrql,
  withUrqlClient,
} from '../../../../graphql/client';

interface Props {
  year: string;
  month: string;
}

export const MonthCircleList: NextPage<Props> = ({ year, month }) => {
  const [{ data, error }] = useQuery({
    query: MonthSurveyDocument,
    variables: { year: parseInt(year), month: parseInt(month) },
  });
  const monthSurvey = data?.monthSurvey;
  if (error) {
    return <p>{error.message}</p>;
  } else if (!monthSurvey) {
    return <p></p>;
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
            {monthSurvey.move.map((monthCircle) => {
              return (
                <TableRow key={monthCircle.id}>
                  <TableCell>{monthCircle.member.name}</TableCell>
                  <TableCell>{monthCircle.currentCircle?.name}</TableCell>
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
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
            <TableCell>除名済み</TableCell>
            <TableCell>Discord残留</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.leave.map((monthCircle) => {
              return (
                <TableRow key={monthCircle.id}>
                  <TableCell>{monthCircle.member.name}</TableCell>
                  <TableCell>{monthCircle.currentCircle?.name}</TableCell>
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
                    <Checkbox
                      checked={monthCircle.state == MonthCircleState.Ob}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <Typography variant="h6">除名者(未回答含む)</Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
            <TableCell>除名済み</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.kick.map((monthCircle) => {
              return (
                <TableRow key={monthCircle.id}>
                  <TableCell>{monthCircle.member.name}</TableCell>
                  <TableCell>{monthCircle.currentCircle?.name}</TableCell>
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
  const [{ fetching }, mutation] = useMutation(UpdateMonthCircleDocument);
  return (
    <LoadingCheckBox
      checked={checked}
      loading={fetching}
      disabled={disabled}
      onCheckChanged={(checked) => {
        mutation({
          data: {
            ...variablesBuilder(checked),
          },
        });
      }}
    />
  );
};

interface PathParams extends ParsedUrlQuery {
  year: string;
  month: string;
}

export const getServerSideProps = getServerSidePropsWithUrql<Props, PathParams>(
  async ({ params }, urql, ssr) => {
    const year = params?.year as string;
    const month = params?.month as string;

    await urql
      .query(MonthSurveyDocument, {
        year: parseInt(year),
        month: parseInt(month),
      })
      .toPromise();

    return {
      props: {
        year,
        month,
        urqlState: ssr.extractData(),
      },
    };
  }
);

export default withUrqlClient(false)(MonthCircleList);
