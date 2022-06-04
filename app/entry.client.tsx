import { CacheProvider } from "@emotion/react";
import { useMediaQuery } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { RemixBrowser } from "@remix-run/react";
import { ConfirmProvider } from "material-ui-confirm";
import * as React from "react";
import { useState } from "react";
import { hydrate } from "react-dom";
import { RecoilRoot, useRecoilValue } from "recoil";

import ClientStyleContext from "~/components/ClientStyleContext";
import createEmotionCache from "~/lib/createEmotionCache";
import { logger } from "~/lib/logger";
import "~/lib/luxon";
import { createTheme } from "./mui/theme";
import { themeModeState } from "./recoil/theme";

interface ClientCacheProviderProps {
  children: React.ReactNode;
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache());

  function reset() {
    setCache(createEmotionCache());
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const themeMode = useRecoilValue(themeModeState);

  logger.debug({ themeMode });
  const theme = React.useMemo(
    () =>
      createTheme({
        mode:
          (themeMode == "system" && prefersDarkMode) || themeMode == "dark"
            ? "dark"
            : "light",
        direction: "ltr",
        responsiveFontSizes: true,
      }),
    [prefersDarkMode, themeMode],
  );
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

hydrate(
  <RecoilRoot>
    <ClientCacheProvider>
      <ClientThemeProvider>
        <ConfirmProvider
          defaultOptions={{
            confirmationText: "OK",
            cancellationText: "キャンセル",
          }}
        >
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <RemixBrowser />
        </ConfirmProvider>
      </ClientThemeProvider>
    </ClientCacheProvider>
  </RecoilRoot>,
  document,
);
