"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/hooks/useI18n";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FAQ() {
  const { t } = useI18n();
  // Get questions from i18n (array of {question, answer})
  const questions = t("faq.questions", { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <div className="w-full bg-[#F5F5F5] pb-10 ">
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle className="bg-[#0A1A2F] md:text-[38px] flex items-center justify-center text-lg text-[#FFEFE5] font-medium md:h-[74px] h-[50px] font-munish">
          {t("faq.title")}
        </CardTitle>
      </CardHeader>
      {/*
      <Accordion
        type="single"
        collapsible
        className="mt-6 sm:mt-10 divide-y divide-gray-900/10"
      >
        {questions.map((faq, index) => (
          <AccordionItem
            key={index}
            value={String(index)}
            className="pt-4 sm:pt-6 border-0"
          >
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
      </Accordion>*/}
      <Tabs defaultValue="generale" className="md:max-w-4xl mx-auto">
        <TabsList className="bg-[#F5F5F5] mx-auto md:gap-10 gap-0 font-munish md:text-[22px] text-base">
          <TabsTrigger
            value="generale"
            className="data-[state=active]:border-b-2 data-[state=active]:bg-[#F5F5F5] data-[state=active]:border-b-black data-[state=active]:text-[#333333] data-[state=active]:shadow-none data-[state=active]:rounded-none md:text-[22px] text-base"
          >
            Generale
          </TabsTrigger>
          <TabsTrigger
            value="costruzione"
            className="data-[state=active]:border-b-2 data-[state=active]:bg-[#F5F5F5] data-[state=active]:border-b-black data-[state=active]:text-[#333333] data-[state=active]:shadow-none data-[state=active]:rounded-none md:text-[22px] text-base"
          >
            Costruzione
          </TabsTrigger>
          <TabsTrigger
            value="assistenza"
            className="data-[state=active]:border-b-2 data-[state=active]:bg-[#F5F5F5] data-[state=active]:border-b-black data-[state=active]:text-[#333333] data-[state=active]:shadow-none data-[state=active]:rounded-none md:text-[22px] text-base"
          >
            Assistenza
          </TabsTrigger>
          <TabsTrigger
            value="legale"
            className="data-[state=active]:border-b-2 data-[state=active]:bg-[#F5F5F5] data-[state=active]:border-b-black data-[state=active]:text-[#333333] data-[state=active]:shadow-none data-[state=active]:rounded-none md:text-[22px] text-base"
          >
            Legale
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generale">
          <Accordion
            type="single"
            collapsible
            className="data-[state=active]:border-b-2 data-[state=active]:border-b-black data-[state=active]:text-[#333333] data-[state=active]:shadow-none data-[state=active]:rounded-none md:text-[22px] text-base"
          >
            {questions.map((faq, index) => (
              <AccordionItem
                key={index}
                value={String(index)}
                className="pt-2 sm:pt-4 border-0"
              >
                <AccordionTrigger className="flex w-full items-start justify-between text-left font-munish text-[#333333] text-sm sm:text-base font-medium leading-6 sm:leading-7 py-0 px-0 bg-transparent hover:underline">
                  Q{index + 1}. {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  <p className="text-xs sm:text-sm md:text-base leading-6 sm:leading-7 font-munish text-[#333333]">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="costruzione">
          Change your costruzione here.
        </TabsContent>
      </Tabs>
    </div>
  );
}
