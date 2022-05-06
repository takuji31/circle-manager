import Link from "~/components/link";
import React from "react";
import { classNames } from "~/lib";

type Props = {
  children: React.ReactNode;
} & React.ComponentProps<"div">;

export function AdminBody({ children, className, ...props }: Props) {
  return (
    <div
      className={classNames(className ?? "", "mx-4 my-4 sm:mx-6 lg:mx-8")}
      {...props}
    >
      {children}
    </div>
  );
}
