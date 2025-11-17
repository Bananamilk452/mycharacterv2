import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Dimmer({ className, children, ...props }: Props) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex size-full items-center justify-center bg-black bg-opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
