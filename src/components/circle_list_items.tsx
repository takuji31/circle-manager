import { LoadingButton } from "@mui/lab";
import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useCircles } from "../hooks/circle";
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from "material-ui-popup-state/hooks";
import { NextLinkComposed } from "./link2";

export const CircleListButton = () => {
  const { circles, error, mutate } = useCircles();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "demoMenu",
  });
  if (error) {
    return <Button color="inherit">{error}</Button>;
  } else if (!circles) {
    return <LoadingButton color="inherit" loading></LoadingButton>;
  } else {
    return (
      <>
        <Button color="inherit" {...bindTrigger(popupState)}>
          サークル一覧
        </Button>
        <Menu {...bindMenu(popupState)}>
          {circles.map((circle) => {
            return (
              <MenuItem
                key={`circles_menu_${circle.id}`}
                component={NextLinkComposed}
                to={`/circles/${circle.id}`}
                onClick={popupState.close}
              >
                {circle.name}
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }
};
