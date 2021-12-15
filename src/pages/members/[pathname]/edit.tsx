import { Alert, Box, FormControl, Grid, Stack, TextField } from '@mui/material';
import { GetServerSideProps } from 'next';
import Layout from '../../../components/layout';
import React, { useState } from 'react';
import {
  PageMemberByPathnameComp,
  ssrMemberByPathname,
} from '../../../apollo/page';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useUpdateMemberMutation } from '../../../apollo';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import { setLocale } from 'yup';
import * as ja from 'yup-locale-ja';
import { yupResolver } from '@hookform/resolvers/yup';

setLocale(ja.suggestive);

const schema = yup
  .object({
    trainerId: yup
      .string()
      .matches(
        /^([0-9]{9}|[0-9]{12})$/,
        '9桁または12桁の数字で入力してください'
      )
      .required(),
  })
  .required();

type MemberFormData = {
  trainerId: string | null;
};

export const Pathname: PageMemberByPathnameComp = ({ data, error }) => {
  const member = data?.member;
  const [isCompleted, setCompleted] = useState(false);
  const [mutation, { loading: isUpdating }] = useUpdateMemberMutation({
    onCompleted: () => {
      setCompleted(true);
    },
  });
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({ mode: 'all', resolver: yupResolver(schema) });
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
    <Layout title={`${member.name} さんのトレーナーID登録`}>
      <FormControl>
        <Stack p={2} spacing={2} sx={{ maxWidth: '600pt' }}>
          {isCompleted && (
            <Alert variant="filled" severity="success">
              保存しました。
            </Alert>
          )}
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
                  defaultValue={member.trainerId ?? ''}
                  render={({ field, fieldState: { invalid } }) => {
                    return (
                      <TextField
                        label="トレーナーID"
                        helperText={
                          errors.trainerId
                            ? errors.trainerId.message
                            : 'サークルへの加入/移籍に必要です。ゲームのプロフィール画面から「IDコピー」でコピーした値を貼り付けてください。'
                        }
                        {...field}
                        error={invalid}
                        disabled={isUpdating}
                        variant="standard"
                        sx={{ width: '100%' }}
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
        </Stack>
      </FormControl>
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
