import { Box } from "@mui/material";
import { GetServerSideProps, NextPage } from "next";
import React from "react";
import Layout from "../../../../components/Layout";

interface Props {
  name: string;
}

const CircleDetail: NextPage<Props> = ({ name }) => {
  return (
    <Layout title={`サークル - ${name}`}>
      <Box />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {};

export default CircleDetail;
