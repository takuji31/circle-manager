import {
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { load } from "dotenv";
import React from "react";
import {
  ListedCircleFragment,
  MemberMonthCircleFragment,
  MonthCircleAnswerState,
  useUpdateMemberMonthCircleMutation,
} from "../generated/graphql";

export const MemberMonthCircle = ({
  memberId,
  monthCircle,
  circles,
}: {
  memberId: string;
  monthCircle: MemberMonthCircleFragment;
  circles: Array<ListedCircleFragment>;
}) => {
  const [
    mutation,
    { data: updated, error: mutationError, loading: mutationLoading },
  ] = useUpdateMemberMonthCircleMutation();
  const { year, month } = monthCircle;
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{`${year}年${month}月の在籍希望`}</Typography>
      <Typography variant="body1">在籍希望を選択してください。</Typography>
      {monthCircle && circles && (
        <ToggleButtonGroup
          value={
            monthCircle.circle?.id ??
            (monthCircle.state == MonthCircleAnswerState.Retired
              ? "retired"
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
                }).then(() => {});
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
                  circleId: "retired",
                  memberId,
                  year,
                  month,
                },
              }).then(() => {});
            }}
          >
            脱退
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Stack>
  );
};
