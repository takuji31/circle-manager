import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { signIn, signOut, useSession } from "next-auth/react";

const LoginButton = () => {
  const { data, status } = useSession();
  if (status == "loading") {
    return (
      <LoadingButton loading loadingIndicator="Loading..." color="inherit" />
    );
  } else if (status == "authenticated") {
    return (
      <Button color="inherit" onClick={() => signOut({ callbackUrl: "/" })}>
        ログアウト
      </Button>
    );
  } else {
    return (
      <Button
        color="inherit"
        onClick={() => signIn("discord", { callbackUrl: "/guilds" })}
      >
        Discordでログイン
      </Button>
    );
  }
};
export default LoginButton;
