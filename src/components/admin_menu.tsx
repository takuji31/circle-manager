import { LoadingButton } from "@mui/lab";
import { Button } from "@mui/material";
import React, { useState } from "react";
import { NextLinkComposed } from "./link2";
import useUser from "../hooks/user";
import * as Icons from "@mui/icons-material";
import { updateMembers } from "../admin/commands/update_members";

export const AdminMenu = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
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
            setLoading(true);
            updateMembers().finally(() => setLoading(false));
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
