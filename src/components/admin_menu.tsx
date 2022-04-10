import { LoadingButton } from '@mui/lab';
import { Button } from '@mui/material';
import React from 'react';
import { NextLinkComposed } from './link';
import useUser from '../hooks/user';
import * as Icons from '@mui/icons-material';
import { useMutation } from 'urql';
import { UpdateMembersDocument } from '../graphql/generated/type';

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
