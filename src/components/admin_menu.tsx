import { LoadingButton } from "@mui/lab";
import { Button } from "@mui/material";
import React, { useState } from "react";
import { NextLinkComposed } from "./link2";
import useUser from "../hooks/user";
import * as Icons from "@mui/icons-material";
import { useUpdateMembersMutation } from "../generated/graphql";

export const AdminMenu = () => {
  const { user } = useUser();
  const [mutation, { data, loading, error }] = useUpdateMembersMutation();
  if (!user || !user.isMember || !user.isAdmin) {
    return <></>;
  } else {
    return (
      <>
        <LoadingButton
          loading={loading}
          color="inherit"
          startIcon={<Icons.AdminPanelSettings />}
          onClick={() => {
            mutation().then(() => {});
          }}
        >
          メンバー表更新
        </LoadingButton>
        <Button
          color="inherit"
          startIcon={<Icons.AdminPanelSettings />}
          component={NextLinkComposed}
          to="/admin/members"
        >
          メンバー一覧
        </Button>
      </>
    );
  }
};
