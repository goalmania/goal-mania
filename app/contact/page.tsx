"use client";

import { Metadata } from "next";
import { Mail, Instagram, Twitter, Phone, MapPin, Send } from "lucide-react";
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#0e1924]">
          {t("contact.title")}
        </CardTitle>
        <CardDescription>{t("contact.description")}</CardDescription>
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
                    <FormLabel>{t("contact.firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("contact.firstNamePlaceholder")}
                        {...field}
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
                    <FormLabel>{t("contact.lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("contact.lastNamePlaceholder")}
                        {...field}
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
                  <FormLabel>{t("contact.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("contact.emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contact.message")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder={t("contact.messagePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#f5963c] hover:bg-[#e0852e] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("contact.sending")}</span>
                </div>
              ) : (
                <span>{t("contact.submit")}</span>
              )}
            </Button>
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
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="lg:hidden">
        <ContactBanner />
      </div>
      <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold mb-6 text-black">
            {t("contact.page.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("contact.page.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}

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

            <div className="bg-[#0A1A2F] border w-full text-white/70 p-6 rounded-2xl mt-5 shadow-lg  ">
              {/* Phone Number */}
              <div className="flex items-center mb-4">
                <Phone className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-lg">+39 090 330 47732</span>
              </div>

              {/* Email */}
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-lg">safe.support@goal-mania.it</span>
              </div>

              {/* Address */}
              <div className="flex items-start mb-4">
                <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-1" />
                <span className="text-lg">
                  3° Piano, Via Roma 245, Complesso i-Hub, di fronte a PRL,
                  Centro, Milano, Lombardia 20100
                </span>
              </div>

              {/* Get Direction */}
              <div className="flex items-center">
                <Send className="w-5 h-5 text-blue-400 mr-3" />
                <a href="#" className="text-lg hover:underline text-blue-300">
                  Get Direction
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
