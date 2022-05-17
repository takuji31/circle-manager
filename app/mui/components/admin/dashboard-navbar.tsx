import { useRef, useState } from "react";
import type { FC } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  IconButton,
  Toolbar,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { AppBarProps } from "@mui/material";
import { AccountPopover } from "./account-popover";
import { useUser } from "~/utils";
import { Menu, Person } from "@mui/icons-material";

interface DashboardNavbarProps extends AppBarProps {
  onOpenSidebar?: () => void;
}

type Language = "en" | "de" | "es";

const languages: Record<Language, string> = {
  en: "/static/icons/uk_flag.svg",
  de: "/static/icons/de_flag.svg",
  es: "/static/icons/es_flag.svg",
};

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  ...(theme.palette.mode === "light"
    ? {
        boxShadow: theme.shadows[3],
      }
    : {
        backgroundColor: theme.palette.background.paper,
        borderBottomColor: theme.palette.divider,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        boxShadow: "none",
      }),
}));

const AccountButton = () => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  // To get the user from the authContext, you can use
  // `const { user } = useAuth();`
  const user = useUser();

  const handleOpenPopover = (): void => {
    setOpenPopover(true);
  };

  const handleClosePopover = (): void => {
    setOpenPopover(false);
  };

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpenPopover}
        ref={anchorRef}
        sx={{
          alignItems: "center",
          display: "flex",
          ml: 2,
        }}
      >
        <Avatar
          sx={{
            height: 36,
            width: 36,
          }}
          src={user.profileImageUrl ?? ""}
        >
          <Person fontSize="small" />
        </Avatar>
      </Box>
      <AccountPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
      />
    </>
  );
};

export const DashboardNavbar: FC<DashboardNavbarProps> = (props) => {
  const { onOpenSidebar, ...other } = props;

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: {
            lg: 280,
          },
          width: {
            lg: "calc(100% - 280px)",
          },
        }}
        {...other}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2,
          }}
        >
          <IconButton
            onClick={onOpenSidebar}
            sx={{
              display: {
                xs: "inline-flex",
                lg: "none",
              },
            }}
          >
            <Menu fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {/* <ContentSearchButton />
          <NotificationsButton /> */}
          <AccountButton />
        </Toolbar>
      </DashboardNavbarRoot>
    </>
  );
};

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};
