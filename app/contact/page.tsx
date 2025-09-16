"use client";

import { Metadata } from "next";
import {
  Mail,
  Instagram,
  Twitter,
  Phone,
  MapPin,
  Send,
  ArrowRightFromLine,
  ArrowRight,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useI18n } from "@/lib/hooks/useI18n";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContactBanner from "@/components/contact/ContactBanner";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FAQ from "../_components/FAQ";

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(1, {
    message: "Please select a subject.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  language: z.enum(["en", "it"], {
    required_error: "Please select your preferred language.",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Email templates
const emailTemplates = {
  en: {
    subject: "New Contact Form Submission - Goal Mania",
    body: (data: ContactFormValues) => `
New contact form submission from Goal Mania website:

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}
Language: English

Message:
${data.message}

---
This message was sent from the Goal Mania contact form.
    `,
  },
  it: {
    subject: "Nuova Richiesta di Contatto - Goal Mania",
    body: (data: ContactFormValues) => `
Nuova richiesta di contatto dal sito web Goal Mania:

Nome: ${data.firstName} ${data.lastName}
Email: ${data.email}
Oggetto: ${data.subject}
Lingua: Italiano

Messaggio:
${data.message}

---
Questo messaggio è stato inviato dal modulo di contatto di Goal Mania.
    `,
  },
};

// Contact form component
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useI18n();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      language: "en",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          emailTemplate: emailTemplates[data.language],
        }),
      });

      if (response.ok) {
        toast.success(t("contact.success"));
        form.reset();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast.error(t("contact.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedLanguage = form.watch("language");

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#0e1924]">
          Scrivici
        </CardTitle>
        <CardDescription>
          Hai una domanda, un suggerimento o semplicemente vuoi salutarci?
          Compila il modulo qui sotto e il nostro team ti risponderà al più
          presto siamo qui per aiutarti!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nome"
                        {...field}
                        className="bg-white border-0 border-b border-black text-[#939393] font-light rounded-none shadow-none pl-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Cognome*"
                        {...field}
                        className="bg-white border-0 border-b border-black text-[#939393] font-light rounded-none shadow-none pl-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Your Email*"
                      {...field}
                      className="bg-white border-0 w-1/2 border-b border-black text-[#939393] font-light rounded-none shadow-none pl-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contact.subject")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("contact.subject")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="order">
                        {t("contact.subjects.order")}
                      </SelectItem>
                      <SelectItem value="product">
                        {t("contact.subjects.product")}
                      </SelectItem>
                      <SelectItem value="delivery">
                        {t("contact.subjects.delivery")}
                      </SelectItem>
                      <SelectItem value="returns">
                        {t("contact.subjects.returns")}
                      </SelectItem>
                      <SelectItem value="sizing">
                        {t("contact.subjects.sizing")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("contact.subjects.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contact.language")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("contact.languageDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />*/}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative w-full">
                      <Textarea
                        rows={10}
                        cols={50}
                        {...field}
                        className="bg-white resize-none border-0 border-b border-black text-[#939393] rounded-none shadow-none pl-0 w-full h-[190px]"
                        placeholder=" "
                      />
                      <span className="absolute bottom-2 left-0 text-[#939393] font-light pointer-events-none">
                        La tua email*
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=" flex justify-between">
              <div className=" space-y-2">
                <Label className=" text-black font-light">Products*</Label>
                <div className=" flex gap-4">
                  <div className="flex items-center gap-1.5 text-[#131228] font-light text-[22px]">
                    <Checkbox id="news" className=" bg-[#D9D9D9" />
                    <Label
                      htmlFor="news"
                      className="text-[#131228] font-light text-[15px]"
                    >
                      News
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5  text-[#131228] font-light text-[22px] ">
                    <Checkbox id="product" className=" bg-[#D9D9D9" />
                    <Label
                      htmlFor="product"
                      className="text-[#131228] font-light text-[15px]"
                    >
                      Product
                    </Label>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-[264px] h-[50px] flex bg-[#FF7A00] hover:bg-[#e0852e] text-[#0A1A2F] rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("contact.sending")}</span>
                  </div>
                ) : (
                  <span className=" flex items-center gap-1.5">
                    Spedisci <ArrowRight />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Social media component
function SocialMediaSection() {
  const { t } = useI18n();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#0e1924] flex items-center">
          <Mail className="h-6 w-6 mr-2 text-[#f5963c]" />
          {t("contact.page.socialMedia.title")}
        </CardTitle>
        <CardDescription>
          {t("contact.page.socialMedia.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://www.instagram.com/goalmaniaofficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <Instagram className="h-6 w-6" />
            <span className="font-semibold">
              {t("contact.page.socialMedia.instagram")}
            </span>
          </a>

          <a
            href="https://x.com/goalmania_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 bg-black rounded-lg text-white hover:bg-gray-800 transition-all duration-200"
          >
            <Twitter className="h-6 w-6" />
            <span className="font-semibold">
              {t("contact.page.socialMedia.twitter")}
            </span>
          </a>

          <a
            href="https://www.tiktok.com/@goalmania_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 bg-black rounded-lg text-white hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.37,23.5a7.468,7.468,0,0,1-7.5-7.5,7.407,7.407,0,0,1,5.483-7.14v3.746a3.763,3.763,0,1,0,4.017,6.344V6.621h3.253a6.3,6.3,0,0,0,.687,3.257h-.687a10.494,10.494,0,0,1-5.253,9.285V23.5Z" />
              <path d="M19.87,0.5H16.62V15.75a3.75,3.75,0,1,1-3.75-3.75h0V8.254a7.5,7.5,0,1,0,7.5,7.5V6.621h1a6.254,6.254,0,0,0,3.63-1.156V2.211A6.257,6.257,0,0,1,19.87.5Z" />
            </svg>
            <span className="font-semibold">
              {t("contact.page.socialMedia.tiktok")}
            </span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// Main contact page component
export default function ContactPage() {
  const { t } = useI18n();

  return (
    <div className="bg-white min-h-screen">
      <div className="lg:hidden">
        <ContactBanner />
      </div>
      <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="w-full">
            <div className="relative h-[400px]  rounded-2xl hidden lg:block">
              <div className="absolute  inset-0">
                <img
                  src={"/images/recentUpdate/contact-main-desktop.png"}
                  alt="Banner Background"
                  className="w-full h-full rounded-2xl  object-center"
                />
              </div>
            </div>

            <div className="bg-[#0A1A2F] border w-full text-[#FAFBFF] p-6 rounded-2xl mt-5 shadow-lg  ">
              <div className="flex items-center mb-4">
                <Phone className="  mr-3" size={20} />
                <span className="text-[16px] font-light text-[#FAFBFF]">
                  +39 090 330 47732
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center mb-4">
                <Mail className=" mr-3" size={20} />
                <span className="text-[16px] font-light">
                  safe.support@goal-mania.it
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start mb-4">
                <div className="">
                  <MapPin className=" mr-3 mt-1" size={20} />
                </div>
                <span className="text-[16px] font-light">
                  3° Piano, Via Roma 245, Complesso i-Hub, di fronte a PRL,
                  Centro, Milano, Lombardia 20100
                </span>
              </div>

              {/* Get Direction */}
              <div className="flex items-center">
                <Send className="mr-3" size={20} />
                <span className="text-[16px] font-light">Get Direction</span>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
      <div className="">
        <FAQ />
      </div>
    </div>
  );
}
