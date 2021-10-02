import { LoadingButton } from "@mui/lab";
import { Button, Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { useCircles } from "../hooks/circle";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from "material-ui-popup-state/hooks";
import { NextLinkComposed } from "../components/link";
import useUser from "../hooks/user";
import * as Icons from "@mui/icons-material";
import { updateMembers } from "../admin/commands/update_members";

export const AdminMenu = () => {
  const { user, status } = useUser();
  const { circles, error, mutate } = useCircles();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "adminMenu",
  });
  const [loading, setLoading] = useState(false);
  if (!user || !user.isMember || !user.isAdmin) {
    return <></>;
  } else if (error) {
    return <Button color="inherit">{error}</Button>;
  } else if (!circles) {
    return <LoadingButton color="inherit" loading></LoadingButton>;
  } else {
    return (
      <>
        <LoadingButton
          loading={loading}
          loadingPosition="start"
          startIcon={<Icons.Settings />}
          color="inherit"
          {...bindTrigger(popupState)}
        >
          管理メニュー
        </LoadingButton>
        <Menu {...bindMenu(popupState)}>
          <MenuItem
            onClick={() => {
              popupState.close();
              setLoading(true);
              updateMembers().finally(() => setLoading(false));
            }}
          >
            メンバー表更新
          </MenuItem>
          <MenuItem component={NextLinkComposed} to="/admin/members">
            メンバー設定
          </MenuItem>
          <MenuItem disabled>サークル設定</MenuItem>
          {circles.map((circle) => {
            return (
              <MenuItem
                key={`admin_circles_menu_${circle.id}`}
                component={NextLinkComposed}
                to={`/admin/circles/${circle.id}`}
                onClick={popupState.close}
              >
                {circle.name}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }
};
