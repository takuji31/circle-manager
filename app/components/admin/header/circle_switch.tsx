import { FormControlLabel, Switch } from "@mui/material";

export interface AdminHeaderCircleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function AdminHeaderCircleSwitch({
  checked,
  onChange,
}: AdminHeaderCircleSwitchProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(event, checked) => onChange(checked)}
        />
      }
      label="所属するサークルのものだけ表示"
    />
  );
}
