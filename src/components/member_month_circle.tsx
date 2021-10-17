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

export interface Props {
  memberId: string;
  year: string;
  month: string;
  monthCircle: MemberMonthCircleFragment | null | undefined;
  circles: Array<ListedCircleFragment>;
  canEdit: boolean;
}

export default function MemberMonthCircle({
  memberId,
  year,
  month,
  monthCircle,
  circles,
  canEdit,
}: Props) {
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
}
