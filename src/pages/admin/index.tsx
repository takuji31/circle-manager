import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { GetStaticProps, NextPage } from "next";
import React from "react";
import { AdminLayout } from "../../components/admin_filter";
import { NextLinkComposed } from "../../components/link2";

const AdminIndex: NextPage = () => {
  return (
    <AdminLayout>
      <Box p={2}>
        <List sx={{ maxWidth: "300pt" }}>
          <ListItem disablePadding>
            <ListItemButton component={NextLinkComposed} to="/admin/members">
              <ListItemText>メンバー一覧</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={NextLinkComposed} to="/admin/members">
              <ListItemText>メンバー一覧</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </AdminLayout>
  );
};

export default AdminIndex;
