import { Checkbox, CircularProgress } from '@mui/material';
import React from 'react';

export const LoadingCheckBox: (props: {
  checked: boolean;
  loading: boolean;
  onCheckChanged: (checked: boolean) => void;
  disabled?: boolean;
}) => JSX.Element = ({ checked, loading, disabled, onCheckChanged }) => {
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      onChange={(e) => {
        onCheckChanged(e.target.checked);
      }}
    />
  );
};
