"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="border-t border-line">
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id} className="border-b border-line">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium transition-colors hover:text-accent sm:text-xl">
              {item.question}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line transition-transform duration-500 ease-expo-out group-data-[state=open]:rotate-45 group-data-[state=open]:border-accent group-data-[state=open]:text-accent">
                <Plus className="h-4 w-4" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_300ms_ease-out] data-[state=open]:animate-[accordion-down_400ms_cubic-bezier(0.16,1,0.3,1)]">
            <p className="max-w-3xl pb-6 leading-relaxed text-fg-muted">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
