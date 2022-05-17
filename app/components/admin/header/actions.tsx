import { Box } from "@mui/material";
import React from "react";

export interface AdminHeaderActionsProps {
  children: React.ReactNode;
}

export default function AdminHeaderActions({
  children,
}: AdminHeaderActionsProps) {
  return (
    <Box ml={{ xs: 0, sm: 4 }} mt={2} flexShrink={0}>
      {children}
    </Box>
  );
}
