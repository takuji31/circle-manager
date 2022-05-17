import React from "react";

type Props = {
  children: React.ReactNode;
} & React.ComponentProps<"div">;

export default function CardHeader({ children, ...props }: Props) {
  return (
    <div
      className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6"
      {...props}
    >
      {children}
    </div>
  );
}
