import { LoadingButton } from '@mui/lab';
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import React from 'react';
import { NextLinkComposed } from './link';
import useUser from '../hooks/user';
import * as Icons from '@mui/icons-material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useMutation, useQuery } from 'urql';
import {
  AdminCirclesDocument,
  UpdateMembersDocument,
} from '../graphql/generated/type';

export const AdminMenu = () => {
  const { user } = useUser();
  const [{ fetching }, mutation] = useMutation(UpdateMembersDocument);
  if (!user || !user.isMember || !user.isAdmin) {
    return <></>;
  } else {
    return (
      <>
        <LoadingButton
          loading={fetching}
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
