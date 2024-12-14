import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const noteVariants = cva("flex flex-col p-4 gap-2 rounded-md border", {
  variants: {
    variant: {
      default: "border-gray-400 bg-gray-100/50",
      warning: "border-yellow-400 bg-yellow-100/50",
      danger: "border-red-400 bg-red-100/50",
      tip: "border-green-400 bg-green-100/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const noteTextVariants = cva("text-sm", {
  variants: {
    variant: {
      default: "text-gray-700",
      warning: "text-yellow-700",
      danger: "text-red-700",
      tip: "text-green-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const noteVariantTitle = {
  default: "정보",
  warning: "경고",
  danger: "위험",
  tip: "팁",
};

export interface NoteProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noteVariants> {}

export const Note = React.forwardRef<HTMLDivElement, NoteProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(noteVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <NoteTitle variant={variant} className="font-bold">
          {noteVariantTitle[variant ?? "default"]}
        </NoteTitle>
        <NoteContent variant={variant} className="">
          {props.children}
        </NoteContent>
      </div>
    );
  },
);

interface NoteTextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof noteTextVariants> {}

function NoteTitle({ variant, children, className }: NoteTextProps) {
  return (
    <h2 className={cn(noteTextVariants({ variant, className }))}>{children}</h2>
  );
}

function NoteContent({ variant, children, className }: NoteTextProps) {
  return (
    <p className={cn(noteTextVariants({ variant, className }))}>{children}</p>
  );
}

Note.displayName = "Note";
