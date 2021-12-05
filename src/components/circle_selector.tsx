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
  useUpdateMemberMonthCircleMutation,
} from '../apollo';
import { getCircleName } from '../model';

export interface Props {
  circleId: string | null | undefined;
  circles: Array<ListedCircleFragment>;
  onClick: () => void;
}

export default function CircleSelector({ circleId, circles, onClick }: Props) {
  if (!circles) return <></>;
  return (
    <ToggleButtonGroup value={circleId}>
      {circles.map((circle) => (
        <ToggleButton value={circle.id} key={circle.id} onClick={onClick}>
          {getCircleName(circle)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
