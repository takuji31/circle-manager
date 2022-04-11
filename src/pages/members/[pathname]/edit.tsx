import { Alert, Box, FormControl, Grid, Stack, TextField } from '@mui/material';
import { NextPage } from 'next';
import Layout from '../../../components/layout';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import { setLocale } from 'yup';
import * as ja from 'yup-locale-ja';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  getServerSidePropsWithUrql,
  withUrqlClient,
} from '../../../graphql/client';
import {
  MemberByPathnameDocument,
  UpdateMemberDocument,
} from '../../../graphql/generated/type';
import { useMutation, useQuery } from 'urql';
import { useTitle } from '../../../recoil/title';

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

interface Props {
  pathname: string;
}

export const Pathname: NextPage<Props> = ({ pathname }) => {
  const [_, setTitle] = useTitle();
  const [{ data, error }] = useQuery({
    query: MemberByPathnameDocument,
    variables: { pathname },
  });
  const member = data?.member;
  const [isCompleted, setCompleted] = useState(false);
  const [{ fetching: isUpdating }, mutation] =
    useMutation(UpdateMemberDocument);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({ mode: 'all', resolver: yupResolver(schema) });

  useEffect(() => {
    if (member) {
      setTitle(`${member.name} さんのトレーナーID登録`);
    }
  }, [member, setTitle]);

  if (error) {
    return <p>{error.message}</p>;
  } else if (!member) {
    return <p></p>;
  }

  const formHandler: SubmitHandler<MemberFormData> = (data) => {
    mutation({
      input: {
        id: member.id,
        ...data,
      },
    }).then((result) => {
      if (!result.error) {
        setCompleted(true);
      }
    });
  };

  return (
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
  );
};

export const getServerSideProps = getServerSidePropsWithUrql<Props>(
  async (ctx, urql, ssr) => {
    const pathname = ctx.params?.pathname as string;

    await urql.query(MemberByPathnameDocument, { pathname }).toPromise();

    return {
      props: {
        pathname,
        urqlState: ssr.extractData(),
      },
    };
  }
);

export default withUrqlClient({ ssr: false })(Pathname);
