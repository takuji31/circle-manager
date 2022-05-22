import { Grid } from "@mui/material";
import React from "react";

const ButtonGridItem: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Grid item xs={12} sm={6}>
      {children}
    </Grid>
  );
};

export default ButtonGridItem;
