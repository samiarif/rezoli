"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReplyToQuoteDialog } from "./ReplyToQuoteDialog";

export function ReplyButton({
  quoteRef,
  customerEmail,
  customerName,
}: {
  quoteRef: string;
  customerEmail: string;
  customerName: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Mail className="size-4" /> Répondre par email
      </Button>
      <ReplyToQuoteDialog
        open={open}
        onOpenChange={setOpen}
        ref={quoteRef}
        customerEmail={customerEmail}
        customerName={customerName}
      />
    </>
  );
}
