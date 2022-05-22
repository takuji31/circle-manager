import { Grid } from "@mui/material";
import React from "react";

const ButtonGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Grid
      container
      direction="row-reverse"
      justifyItems={{ xs: "center", sm: "end" }}
    >
      {children}
    </Grid>
  );
};

export default ButtonGrid;
