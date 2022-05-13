import * as React from "react";
import { useState } from "react";
import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import ClientStyleContext from "~/components/ClientStyleContext";
import createEmotionCache from "~/lib/createEmotionCache";
import "flowbite";
import { createTheme } from "./mui/theme";
import { useMediaQuery } from "@mui/material";
import "~/lib/luxon";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
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

  console.log(themeMode);
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
    [prefersDarkMode, themeMode]
  );
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

hydrate(
  <RecoilRoot>
    <ClientCacheProvider>
      <ClientThemeProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <RemixBrowser />
      </ClientThemeProvider>
    </ClientCacheProvider>
  </RecoilRoot>,
  document
);
