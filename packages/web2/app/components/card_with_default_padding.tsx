import React from "react";
import { classNames } from "~/lib";

const CardWithDefaultPadding: React.FC<
  {
    children?: React.ReactNode;
    header?: React.ReactNode;
  } & React.ComponentProps<"div">
> = ({ children, header, className, ...props }) => {
  return (
    <div
      className={classNames("overflow-hidden rounded-lg bg-white shadow")}
      {...props}
    >
      {header && (
        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
          {header}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
};

export default CardWithDefaultPadding;
