import styled from '@emotion/styled';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '../../../components/layout';
import { prisma } from '../../../database';
import React, { useState } from 'react';

/* eslint-disable-next-line */
export interface PathnameProps {
  memberId: string;
  name: string;
}

export function Pathname({ memberId, name }: PathnameProps) {
  const [trainerId, setTrainerId] = useState('');
  const [changed, setChanged] = useState(false);
  return (
    <Layout title={`${name} さんの基本情報`}>
      <Container maxWidth="md">
        <Stack p={2} sx={{ maxWidth: '600pt' }}>
          <Typography variant="body1">
            こちらの情報はサークル運営のために必要です。入力にご協力お願いします。
          </Typography>
          <TextField
            label="トレーナーID"
            helperText="月初の異動を迅速に行うために必要です。ゲームのプロフィール画面から「IDコピー」でコピーした値を貼り付けてください。"
            value={trainerId}
            onChange={(e) => {
              setTrainerId(e.target.value);
              setChanged(true);
            }}
            variant="standard"
          />
        </Stack>
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<PathnameProps> = async (req) => {
  const pathname = req.params?.pathname as string;
  const member = await prisma.member.findUnique({
    where: {
      pathname: pathname,
    },
  });
  if (!member) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      memberId: member.id,
      name: member.name,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const members = await prisma.member.findMany({});
  return {
    paths: members.map((member) => ({
      params: {
        pathname: member.pathname,
      },
    })),
    fallback: 'blocking',
  };
};

export default Pathname;
