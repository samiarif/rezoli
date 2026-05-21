import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-teal-100 text-teal-800",
        outline:
          "border-teal-500 text-teal-700",
        amber:
          "border-transparent bg-amber-100 text-amber-700",
        success:
          "border-transparent bg-emerald-100 text-emerald-700",
        warning:
          "border-transparent bg-amber-100 text-amber-700",
        danger:
          "border-transparent bg-red-100 text-red-700",
        neutral:
          "border-transparent bg-neutral-100 text-neutral-700",
        dark:
          "border-transparent bg-neutral-900 text-cream-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
