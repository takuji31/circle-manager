import {
  Box,
  Container,
  FormControl,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GetServerSideProps } from 'next';
import Layout from '../../../components/layout';
import React from 'react';
import {
  PageMemberByPathnameComp,
  ssrMemberByPathname,
} from '../../../apollo/page';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useUpdateMemberMutation } from '../../../apollo';
import { LoadingButton } from '@mui/lab';

type MemberFormData = {
  trainerId: string | null;
};

export const Pathname: PageMemberByPathnameComp = ({ data, error }) => {
  const member = data?.member;
  const [mutation, { loading: isUpdating }] = useUpdateMemberMutation();
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>();
  if (error) {
    return <p>{error.message}</p>;
  } else if (!member) {
    return <p></p>;
  }

  const formHandler: SubmitHandler<MemberFormData> = (data) => {
    mutation({
      variables: {
        input: {
          id: member.id,
          ...data,
        },
      },
    });
  };

  return (
    <Layout title={`${member.name} さんの基本情報`}>
      <Container maxWidth="md">
        <Stack p={2} sx={{ maxWidth: '600pt' }}>
          <FormControl>
            <Typography variant="body1">
              こちらの情報はサークル運営のために必要です。入力にご協力お願いします。
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit(formHandler)}
              sx={{ mt: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="trainerId"
                    control={control}
                    defaultValue={member.trainerId ?? null}
                    render={({ field }) => {
                      return (
                        <TextField
                          label="トレーナーID"
                          helperText="月初の異動を迅速に行うために必要です。ゲームのプロフィール画面から「IDコピー」でコピーした値を貼り付けてください。"
                          {...field}
                          disabled={isUpdating}
                          variant="standard"
                        />
                      );
                    }}
                  />
                </Grid>
                <Grid container item xs={12} justifyContent="flex-end">
                  <Grid item>
                    <LoadingButton
                      loading={isUpdating}
                      type="submit"
                      variant="contained"
                    >
                      保存
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </FormControl>
        </Stack>
      </Container>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = (req) => {
  const pathname = req.params?.pathname as string;
  return ssrMemberByPathname.getServerPage({
    variables: { pathname },
  });
};

export default ssrMemberByPathname.withPage((arg) => {
  return {
    variables: {
      pathname: arg.query.pathname as string,
    },
  };
})(Pathname);
