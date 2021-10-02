import React from "react";
import useUser from "../hooks/user";
import Layout from "./layout";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export const AdminLayout = ({ children, title = "管理画面" }: LayoutProps) => {
  const { user, status } = useUser();
  return (
    <Layout title={title}>
      {status == "loading" && <p>Loading...</p>}
      {status != "loading" && (!user || !user.isAdmin) && <p>Access Denined</p>}
      {user && user.isAdmin && children}
    </Layout>
  );
};
