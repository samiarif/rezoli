"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { faqGeneral, type FaqItem } from "@/lib/catalog";

export function FAQ({
  heading = "Questions fréquentes",
  eyebrow = "FAQ",
  items = faqGeneral,
}: {
  heading?: string;
  eyebrow?: string;
  items?: FaqItem[];
}) {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-2 mt-2 text-balance">{heading}</h2>
        </div>
        <Accordion type="single" collapsible className="rounded-xl bg-background border border-border divide-y divide-border px-4 sm:px-6">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-b-0">
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
