import React from "react";
import { classNames } from "~/lib";

const Card: React.FC<
  {
    children?: React.ReactNode;
  } & React.ComponentProps<"div">
> = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames(
        className ?? "",
        "overflow-hidden rounded-lg bg-white shadow"
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
