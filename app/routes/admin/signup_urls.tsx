import { Circles } from "@/model";
import { ContentCopy } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import type { CircleKey } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { requireAdminUser } from "~/auth/loader.server";
import { AdminBody } from "~/components/admin/body";
import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import { createSignUpUrl, getSignUpUrls } from "~/model/signup.server";
import { SignUpUrlParams } from "~/schema/signup.server";
import { useUser } from "~/utils";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData() {
  return {
    signUpUrls: await getSignUpUrls(),
  };
}

export const loader: LoaderFunction = async (args) => {
  return await getLoaderData();
};
export const action: ActionFunction = async ({ request }) => {
  const user = await requireAdminUser(request);
  const formData = Object.fromEntries(await request.formData());

  const { circleKey, memo } = SignUpUrlParams.parse(formData);

  await createSignUpUrl({ circleKey, memo, creatorId: user.id });
  return null;
};

export default function SignUpUrlsIndex() {
  const { signUpUrls } = useLoaderData<LoaderData>();
  const user = useUser();
  const [memo, setMemo] = useState("");
  const [circleKey, setCircleKey] = useState(user.circleKey);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  return (
    <Stack>
      <AdminHeader>
        <AdminHeaderTitle title="加入申請URL" />
      </AdminHeader>
      <AdminBody>
        <Stack spacing={4}>
          <Form method="post" replace={true}>
            <Card>
              <CardHeader
                title="発行"
                subheader="加入申請に必要なURLを発行します。1人ずつ個別に発行する必要があります。"
              />
              <CardContent>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel id="circle-label">サークル</FormLabel>
                    <RadioGroup
                      aria-labelledby="circle-label"
                      value={circleKey}
                      onChange={(e, value) => setCircleKey(value as CircleKey)}
                      name="circleKey"
                    >
                      {Circles.activeCircles.map((circle) => {
                        return (
                          <FormControlLabel
                            value={circle.key}
                            key={circle.key}
                            control={<Radio />}
                            label={circle.name}
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <TextField
                    name="memo"
                    label="メモ"
                    helperText="Twitter経由ならTwitterアカウント、他のDiscordサーバー経由ならDiscordサーバーの名前やユーザー名、掲示板経由ならURLなど誰か紐付けやすい情報を入力すると便利です。"
                    value={memo}
                    onChange={(e) => setMemo(e.currentTarget.value)}
                  />
                </Stack>
              </CardContent>
              <CardActions>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    p: 2,
                  }}
                >
                  <Button type="submit" variant="contained" size="small">
                    発行
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Form>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>サークル</TableCell>
                <TableCell>作成者</TableCell>
                <TableCell>作成日</TableCell>
                <TableCell>メモ</TableCell>
                <TableCell>URLをコピー</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signUpUrls.map(s => {
                return <TableRow>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.circle.name}</TableCell>
                  <TableCell>{s.creator.name}</TableCell>
                  <TableCell>{s.createdAtString}</TableCell>
                  <TableCell>{s.memo ? s.memo : "(未入力)"}</TableCell>
                  <TableCell>
                    <CopyToClipboard text={s.permalink} onCopy={() => setOpen(true)}>
                      <IconButton>
                        <ContentCopy />
                      </IconButton>
                    </CopyToClipboard>
                  </TableCell>
                </TableRow>;

              })}
            </TableBody>
          </Table>
        </Stack>
      </AdminBody>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
          URLをコピーしました
        </Alert>
      </Snackbar>
    </Stack>
  );
}
