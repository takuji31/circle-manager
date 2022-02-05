import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React from 'react';
import { useMutation } from 'urql';
import {
  ListedCircleFragment,
  MemberMonthCircleFragment,
  UpdateMemberMonthCircleDocument,
} from '../graphql/generated/type';
import { getCircleName } from '../model';

export interface Props {
  memberId: string;
  year: number;
  month: number;
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
  const [state, mutation] = useMutation(UpdateMemberMonthCircleDocument);
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{`${year}年${month}月の在籍希望`}</Typography>
      {!canEdit && (
        <Typography variant="body1">
          {monthCircle?.circle ? getCircleName(monthCircle.circle) : '未回答'}
        </Typography>
      )}
      {canEdit && (
        <>
          <Typography variant="body1">在籍希望を選択してください。</Typography>
          {circles && (
            <ToggleButtonGroup value={monthCircle?.circle?.id}>
              {circles.map((circle) => (
                <ToggleButton
                  value={circle.id}
                  key={circle.id}
                  onClick={() => {
                    mutation({
                      circleId: circle.id,
                      memberId,
                      year,
                      month,
                    }).then(() => {
                      return;
                    });
                  }}
                >
                  {getCircleName(circle)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </>
      )}
    </Stack>
  );
}
