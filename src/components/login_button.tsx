import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const LoginButton = () => {
  const { status } = useSession();
  const router = useRouter();
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
        onClick={() => signIn("discord", { callbackUrl: router.pathname })}
      >
        Discordでログイン
      </Button>
    );
  }
};
export default LoginButton;
