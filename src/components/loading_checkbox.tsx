import { Checkbox, CircularProgress } from '@mui/material';
import React from 'react';

export const LoadingCheckBox: (props: {
  checked: boolean;
  loading: boolean;
  onCheckChanged: (checked: boolean) => void;
}) => JSX.Element = ({ checked, loading, onCheckChanged }) => {
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Checkbox
      checked={checked}
      onChange={(e) => {
        onCheckChanged(e.target.checked);
      }}
    />
  );
};
