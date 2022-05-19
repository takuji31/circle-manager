import type { FC } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Form } from "@remix-run/react";
import { useUser } from "~/utils";
import { Circles } from "@/model";
import { Person } from "@mui/icons-material";

interface AccountPopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  open?: boolean;
}

export const AccountPopover: FC<AccountPopoverProps> = (props) => {
  const { anchorEl, onClose, open, ...other } = props;
  const user = useUser();

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "center",
        vertical: "bottom",
      }}
      keepMounted
      onClose={onClose}
      open={!!open}
      PaperProps={{ sx: { width: 300 } }}
      transitionDuration={0}
      {...other}
    >
      <Box
        sx={{
          alignItems: "center",
          p: 2,
          display: "flex",
        }}
      >
        <Avatar
          src={user.profileImageUrl ?? ""}
          sx={{
            height: 40,
            width: 40,
          }}
        >
          <Person fontSize="small" />
        </Avatar>
        <Box
          sx={{
            ml: 1,
          }}
        >
          <Typography variant="body1">{user.name}</Typography>
          <Typography color="textSecondary" variant="body2">
            {user.circleKey ? Circles.findByCircleKey(user.circleKey).name : ""}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ my: 1 }}>
        {/* <Link to="/dashboard/social/profile">
          <MenuItem component="a">
            <ListItemIcon>
              <UserCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body1">Profile</Typography>}
            />
          </MenuItem>
        </Link>
        <Link to="/dashboard/account">
          <MenuItem component="a">
            <ListItemIcon>
              <CogIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body1">Settings</Typography>}
            />
          </MenuItem>
        </Link>
        <Link to="/dashboard">
          <MenuItem component="a">
            <ListItemIcon>
              <SwitchHorizontalOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1">Change organization</Typography>
              }
            />
          </MenuItem>
        </Link> */}
        {/* <Divider /> */}
        <MenuItem
          component="button"
          className="w-full text-left"
          type="submit"
          form="logoutForm"
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body1">Logout</Typography>}
          />
          <Form method="post" action="/auth/logout" id="logoutForm"></Form>
        </MenuItem>
      </Box>
    </Popover>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
