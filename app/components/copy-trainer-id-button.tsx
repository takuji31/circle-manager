import { ContentCopy } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

export default function CopyTrainerIdButton({ trainerId }: { trainerId: string }) {
  const [copied, setCopied] = useState(false);
  return <CopyToClipboard
    text={trainerId}
    onCopy={() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }}
  >
    {copied ? (
      <Typography variant="body2" py={4}>
        コピーしました
      </Typography>
    ) : (
      <Button
        variant="text"
        type="button"
        size="small"
        startIcon={<ContentCopy />}
      >
        トレーナーIDをコピー
      </Button>
    )}
  </CopyToClipboard>;
}
