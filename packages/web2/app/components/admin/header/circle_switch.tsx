import { Switch } from "@headlessui/react";
import { classNames } from "~/lib";
import React from "react";

export interface AdminHeaderCircleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function AdminHeaderCircleSwitch({
  checked,
  onChange,
}: AdminHeaderCircleSwitchProps) {
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={checked}
        onChange={onChange}
        className={classNames(
          checked ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            checked ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="cursor-pointer text-sm font-medium text-gray-900">
          所属するサークルのものだけ表示
        </span>
      </Switch.Label>
    </Switch.Group>
  );
}
