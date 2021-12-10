import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { GetServerSideProps } from 'next';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Layout from '../../../../components/layout';
import * as yup from 'yup';
import { setLocale } from 'yup';
import * as ja from 'yup-locale-ja';
import { getCircleName } from '../../../../model';
import { PageSetupComp, ssrSetup } from '../../../../apollo/page';
import { useUpdateSetupMutation } from '../../../../apollo';
import { yupResolver } from '@hookform/resolvers/yup';

setLocale(ja.suggestive);

type SetupFormData = {
  circleId: string;
  name: string;
  trainerId: string;
};

const schema = yup
  .object({
    circleId: yup.string().required('選択してください'),
    name: yup.string().required(),
    trainerId: yup
      .string()
      .matches(
        /^([0-9]{9}|[0-9]{12})$/,
        '9桁または12桁の数字で入力してください'
      )
      .required(),
  })
  .required();

const Setup: PageSetupComp = ({ data, error }) => {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({ mode: 'all', resolver: yupResolver(schema) });

  const [mutation, { loading }] = useUpdateSetupMutation();

  const member = data?.member;
  const circles = data?.circles;

  if (error) {
    return <p>{error.message}</p>;
  } else if (!member || !circles) {
    return <p></p>;
  }

  const formHandler: SubmitHandler<SetupFormData> = (data) => {
    console.log('onSubmit');
    mutation({
      variables: {
        memberId: member.id,
        ...data,
      },
    }).then(() => {});
  };

  return (
    <Layout title="加入申請">
      <Stack p={2} spacing={2} sx={{ maxWidth: '600pt' }}>
        {member.setupCompleted && (
          <Alert severity="success" variant="filled">
            加入申請が完了しました。この画面を閉じてDiscordに戻ってください。
          </Alert>
        )}
        <Typography variant="body1">
          ウマ娘愛好会グループへようこそ。こちらでサークル加入に必要な情報を入力していただきます。
          <br />
          不明な点はDiscordの #サポート で気軽にお問い合わせください。
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(formHandler, (e) => {
            console.log(e);
          })}
          sx={{ mt: 3 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="circleId"
                control={control}
                defaultValue={member.signUp?.circle.id}
                render={({ field, fieldState }) => {
                  return (
                    <Stack spacing={2}>
                      <Typography variant="body1">
                        加入予定のサークル
                      </Typography>
                      <ToggleButtonGroup value={field.value}>
                        {circles.map((circle) => (
                          <ToggleButton
                            value={circle.id}
                            key={circle.id}
                            onClick={() => {
                              setValue('circleId', circle.id);
                            }}
                          >
                            {getCircleName(circle)}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      {fieldState.error && (
                        <Typography variant="caption" color="error">
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </Stack>
                  );
                }}
                rules={{ required: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                defaultValue={member.name}
                render={({ field }) => {
                  return (
                    <TextField
                      label="トレーナー名"
                      helperText={
                        errors.name?.message ??
                        '円滑な運営のためにサーバーニックネームをトレーナー名に変更します。Discordのユーザー名には影響はありません。'
                      }
                      {...field}
                      error={!!errors.name?.message}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  );
                }}
                rules={{ required: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="trainerId"
                control={control}
                defaultValue={member.trainerId ?? ''}
                render={({ field }) => {
                  return (
                    <TextField
                      label="トレーナーID"
                      helperText={
                        errors.trainerId?.message ??
                        '加入手続きや姉妹サークルへの移籍を行うために必要です。ゲームのプロフィール画面から「IDコピー」でコピーした値を貼り付けてください。'
                      }
                      {...field}
                      error={!!errors.trainerId?.message}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  );
                }}
                rules={{ required: true }}
              />
            </Grid>
            <Grid container item xs={12} justifyContent="flex-end">
              <Grid item>
                <LoadingButton
                  loading={loading}
                  type="submit"
                  variant="contained"
                >
                  {member.setupCompleted ? '申請内容を修正' : '申請'}
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = (req) => {
  const pathname = req.params?.pathname as string;
  return ssrSetup.getServerPage({
    variables: { pathname },
  });
};

export default ssrSetup.withPage((arg) => {
  return {
    variables: {
      pathname: arg.query.pathname as string,
    },
  };
})(Setup);
