import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import { Check, CircleAlert } from "lucide-react";

const messageVariants = cva("flex items-center gap-2", {
  variants: {
    variant: {
      loading: "text-gray-600",
      success: "text-green-600",
      error: "text-red-600",
    },
  },
});

export interface MessageProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageVariants> {}

const Icon = {
  loading: Spinner,
  success: Check,
  error: CircleAlert,
};

export function Message({ className, variant, ...props }: MessageProps) {
  const IconComponent = Icon[variant ?? "loading"];

  return (
    <div className={cn(messageVariants({ variant, className }))} {...props}>
      <IconComponent className={cn("size-5", messageVariants({ variant }))} />
      <span className={cn("text-sm", messageVariants({ variant }))}>
        {props.children}
      </span>
    </div>
  );
}
