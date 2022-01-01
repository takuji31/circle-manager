import { LoadingButton } from '@mui/lab';
import {
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { NextLinkComposed } from './link';
import useUser from '../hooks/user';
import * as Icons from '@mui/icons-material';
import { useAdminCirclesQuery, useUpdateMembersMutation } from '../apollo';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

export const AdminMenu = () => {
  const { user, status } = useUser();
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
            mutation().then(() => {
              return;
            });
          }}
        >
          メンバー表更新
        </LoadingButton>
        <CircleMenu />
      </>
    );
  }
};

const CircleMenu: React.VFC = () => {
  const { data, loading, error } = useAdminCirclesQuery();
  if (loading || !data) {
    return <CircularProgress color="inherit" />;
  } else if (error) {
    return (
      <Typography color="error" variant="caption">
        {error.message}
      </Typography>
    );
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={<Icons.AdminPanelSettings />}
        component={NextLinkComposed}
        to="/admin/members"
      >
        メンバー一覧
      </Button>
      <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
          <>
            <Button
              startIcon={<Icons.AdminPanelSettings />}
              size="large"
              {...bindTrigger(popupState)}
              color="inherit"
            >
              サークル
            </Button>
            <Menu {...bindMenu(popupState)}>
              {data.circles.map((circle) => {
                return (
                  <MenuItem
                    component={NextLinkComposed}
                    onClick={popupState.close}
                    to={`/admin/circles/${circle.id}`}
                    key={`circle_menu_${circle.id}`}
                  >
                    {circle.name}
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}
      </PopupState>
    </>
  );
};
