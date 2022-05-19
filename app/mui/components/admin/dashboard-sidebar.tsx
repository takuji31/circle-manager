import { useEffect, useMemo, useRef, useState } from "react";
import type { FC, ReactNode } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Link,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import type { Theme } from "@mui/material";
import { Logo } from "../logo";
import { Scrollbar } from "../scrollbar";
import { DashboardSidebarSection } from "./dashboard-sidebar-section";
import { OrganizationPopover } from "./organization-popover";
import { useLocation } from "@remix-run/react";
import { Group, Home, PersonAdd, UnfoldMore } from "@mui/icons-material";
import { SelectorIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import { Circles } from "@/model";

interface DashboardSidebarProps {
  onClose?: () => void;
  open?: boolean;
}

interface Item {
  title: string;
  children?: Item[];
  chip?: ReactNode;
  icon?: ReactNode;
  path?: string;
}

interface Section {
  title: string;
  items: Item[];
}

const getSections = (): Section[] => {
  const thisMonth = DateTime.now().startOf("month");
  const nextMonth = thisMonth.plus({ months: 1 });
  return [
    {
      title: "管理",
      items: [
        {
          title: "ホーム",
          path: "/admin/",
          icon: <Home fontSize="small" />,
        },
        {
          title: "メンバー一覧",
          path: "/admin/members/",
          icon: <Group fontSize="small" />,
        },
        {
          title: "加入申請",
          path: "/admin/signups/",
          icon: <PersonAdd fontSize="small" />,
        },
      ],
    },
    {
      title: "サークル",
      items: Circles.activeCircles.map((circle) => {
        return {
          title: circle.name,
          path: `/admin/circles/${circle.key}`,
        };
      }),
    },
    {
      title: "移籍表",
      items: [thisMonth, nextMonth].map((month) => {
        return {
          title: `${month.year}年${month.month}月`,
          path: `/admin/month_circles/${month.year}/${month.month}`,
        };
      }),
    },
  ];
};

export const DashboardSidebar: FC<DashboardSidebarProps> = (props) => {
  const { onClose, open } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const location = useLocation();
  const sections = useMemo(() => getSections(), []);
  const organizationsRef = useRef<HTMLButtonElement | null>(null);
  const [openOrganizationsPopover, setOpenOrganizationsPopover] =
    useState<boolean>(false);

  const handlePathChange = () => {
    if (open) {
      onClose?.();
    }
  };

  useEffect(
    handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const handleOpenOrganizationsPopover = (): void => {
    setOpenOrganizationsPopover(true);
  };

  const handleCloseOrganizationsPopover = (): void => {
    setOpenOrganizationsPopover(false);
  };

  const content = (
    <>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div>
            <Box sx={{ p: 3 }}>
              <Link href="/">
                <Typography variant="h4">ウマ娘愛好会</Typography>
              </Link>
            </Box>
            {/* <Box sx={{ px: 2 }}>
              <Box
                onClick={handleOpenOrganizationsPopover}
                ref={organizationsRef}
                sx={{
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  px: 3,
                  py: "11px",
                  borderRadius: 1,
                }}
              >
                <div>
                  <Typography color="inherit" variant="subtitle1">
                    Acme Inc
                  </Typography>
                  <Typography color="neutral.400" variant="body2">
                    {"Your tier"} : Premium
                  </Typography>
                </div>
                <UnfoldMore
                  fontSize="small"
                  sx={{
                    color: "neutral.500",
                  }}
                />
              </Box>
            </Box> */}
          </div>
          <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
              my: 3,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            {sections.map((section) => (
              <DashboardSidebarSection
                key={section.title}
                path={location.pathname}
                sx={{
                  mt: 2,
                  "& + &": {
                    mt: 2,
                  },
                }}
                {...section}
              />
            ))}
          </Box>
          {/* <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
            }}
          />
          <Box sx={{ p: 2 }}>
            <Typography color="neutral.100" variant="subtitle2">
              {"Need Help?"}
            </Typography>
            <Typography color="neutral.500" variant="body2">
              {"Check our docs"}
            </Typography>
            <Link href="/docs/welcome">
              <Button
                color="secondary"
                component="a"
                fullWidth
                sx={{ mt: 2 }}
                variant="contained"
              >
                {"Documentation"}
              </Button>
            </Link>
          </Box> */}
        </Box>
      </Scrollbar>
      <OrganizationPopover
        anchorEl={organizationsRef.current}
        onClose={handleCloseOrganizationsPopover}
        open={openOrganizationsPopover}
      />
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            borderRightColor: "divider",
            borderRightStyle: "solid",
            borderRightWidth: (theme) =>
              theme.palette.mode === "dark" ? 1 : 0,
            color: "#FFFFFF",
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "neutral.900",
          color: "#FFFFFF",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
