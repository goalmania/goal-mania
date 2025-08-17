"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/hooks/useI18n";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AuroraText } from "@/components/magicui/aurora-text";

export default function FAQ() {
  const { t } = useI18n();
  // Get questions from i18n (array of {question, answer})
  const questions = t('faq.questions', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  return (
    <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md"
        >
          <AuroraText colors={['#f5963c', '#0e1924']}>
          {t('faq.title')}
          </AuroraText>
        </CardTitle>
      </CardHeader>
      <Accordion type="single" collapsible className="mt-6 sm:mt-10 divide-y divide-gray-900/10">
        {questions.map((faq, index) => (
          <AccordionItem key={index} value={String(index)} className="pt-4 sm:pt-6 border-0">
            <AccordionTrigger className="flex w-full items-start justify-between text-left text-gray-900 text-sm sm:text-base font-semibold leading-6 sm:leading-7 py-0 px-0 bg-transparent hover:underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6">
              <p className="text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-gray-600">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
