import { Divider } from "@mui/material";
import { Stack } from "@mui/material";
import { Box } from "@mui/material";
import React from "react";

export interface AdminHeaderProps {
  children: React.ReactNode;
}

export default function AdminHeader({ children }: AdminHeaderProps) {
  return (
    <Stack>
      <Box
        px={4}
        py={2}
        display={{ xs: "block", sm: "flex" }}
        alignItems="center"
        justifyContent={{ xs: "start", sm: "space-between" }}
      >
        {children}
      </Box>
      <Divider />
    </Stack>
  );
}
