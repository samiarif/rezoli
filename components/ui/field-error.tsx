import { cn } from "@/lib/utils";

export function FieldError({
  message,
  id,
  className,
}: {
  message?: string;
  id?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("mt-1.5 text-xs text-danger", className)}
    >
      {message}
    </p>
  );
}
