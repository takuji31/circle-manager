import {
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React from 'react';
import { useMutation, useQuery } from 'urql';
import {
  AdminMemberMonthCircleDocument,
  MonthCircleState,
  UpdateMemberMonthCircleDocument,
} from '../graphql/generated/type';
import { monthCircleStateLabel } from '../model/month_circle';

export interface Props {
  memberId: string;
  year: number;
  month: number;
}

export default function MemberMonthCircle({ memberId, year, month }: Props) {
  const [{ data, fetching }, refetch] = useQuery({
    query: AdminMemberMonthCircleDocument,
    variables: {
      memberId,
      year,
      month,
    },
  });
  const [state, mutation] = useMutation(UpdateMemberMonthCircleDocument);
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{`${data?.member?.name}さんの${year}年${month}月サークル`}</Typography>
      <Typography variant="body1">サークルを変更します。</Typography>
      <ToggleButtonGroup
        value={data?.member?.monthCircle?.state}
        disabled={state.fetching || fetching}
      >
        {Object.values(MonthCircleState).map((state) => (
          <ToggleButton
            value={state}
            key={state}
            onClick={() => {
              mutation({
                input: {
                  memberId,
                  year,
                  month,
                  state,
                },
              }).then(() => {
                refetch({ requestPolicy: 'network-only' });
                return;
              });
            }}
          >
            {monthCircleStateLabel(state)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <FormControlLabel
        control={
          <Switch
            disabled={!data?.member?.monthCircle}
            checked={data?.member?.monthCircle?.locked}
            onChange={(event, checked) => {
              mutation({
                input: {
                  year,
                  month,
                  memberId,
                  locked: checked,
                },
              })
                .then(() => {})
                .catch(() => {
                  event.target.checked = !checked;
                });
            }}
          />
        }
        label="変更をロックする(ランキング作成時に上書きされなくなります)"
      />
    </Stack>
  );
}
