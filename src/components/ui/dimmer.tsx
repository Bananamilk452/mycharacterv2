import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Dimmer({ className, children, ...props }: Props) {
  return (
    <div
      className={cn(
        "bg-opacity-50 fixed inset-0 z-50 flex size-full items-center justify-center bg-black",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
