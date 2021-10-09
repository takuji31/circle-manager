import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ListedCircleFragment,
  MemberMonthCircleFragment,
  MonthCircleAnswerState,
  useUpdateMemberMonthCircleMutation,
} from '../apollo';

export const MemberMonthCircle = ({
  memberId,
  year,
  month,
  circles,
  canEdit,
  ...pageProps
}: {
  memberId: string;
  year: string;
  month: string;
  monthCircle: MemberMonthCircleFragment | null;
  circles: Array<ListedCircleFragment>;
  canEdit: boolean;
}) => {
  const monthCircle = pageProps.monthCircle as MemberMonthCircleFragment | null;
  const [mutation] = useUpdateMemberMonthCircleMutation();
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{`${year}年${month}月の在籍希望`}</Typography>
      {!canEdit && (
        <Typography variant="body1">
          {monthCircle?.circle?.name ??
            (monthCircle?.state == MonthCircleAnswerState.Retired
              ? '脱退'
              : '未回答')}
        </Typography>
      )}
      {canEdit && (
        <>
          <Typography variant="body1">在籍希望を選択してください。</Typography>
          {circles && (
            <ToggleButtonGroup
              value={
                monthCircle?.circle?.id ??
                (monthCircle?.state == MonthCircleAnswerState.Retired
                  ? 'retired'
                  : null)
              }
            >
              {circles.map((circle) => (
                <ToggleButton
                  value={circle.id}
                  key={`month_circle_toggle_${circle.id}`}
                  onClick={() => {
                    mutation({
                      variables: {
                        circleId: circle.id,
                        memberId,
                        year,
                        month,
                      },
                    }).then(() => {
                      return;
                    });
                  }}
                >
                  {circle.name}
                </ToggleButton>
              ))}
              <ToggleButton
                value="retired"
                onClick={() => {
                  mutation({
                    variables: {
                      circleId: 'retired',
                      memberId,
                      year,
                      month,
                    },
                  }).then(() => {
                    return;
                  });
                }}
              >
                脱退
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </>
      )}
    </Stack>
  );
};
