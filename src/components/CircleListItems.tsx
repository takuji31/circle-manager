import { List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { useCircles } from "../hooks/circle";

export const CircleListItems = () => {
  const { circles, error, mutate } = useCircles();
  if (error) {
    return (
      <ListItem>
        <ListItemText>{error}</ListItemText>
      </ListItem>
    );
  } else if (!circles) {
    return (
      <ListItem>
        <ListItemText>Loading...</ListItemText>
      </ListItem>
    );
  } else {
    return (
      <>
        {circles.map((circle) => {
          return (
            <ListItem>
              <ListItemText>{circle.name}</ListItemText>
            </ListItem>
          );
        })}
      </>
    );
  }
};
