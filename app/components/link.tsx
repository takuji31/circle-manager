import { Link as RemixLink } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { classNames } from "~/lib";

const Link: React.FC<{ children: React.ReactNode } & RemixLinkProps &
  React.RefAttributes<HTMLAnchorElement>> = ({ children, className, ...props }) => {
  return (
    <RemixLink
      className={classNames(
        "text-indigo-600 hover:text-indigo-900",
        className ?? "",
      )}
      {...props}
    >
      {children}
    </RemixLink>
  );
};

export default Link;
