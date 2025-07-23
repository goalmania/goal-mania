"use client";

import { Metadata } from "next";
import { Mail, Instagram, Twitter } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        toast.success(
          data.language === "en" 
            ? "Message sent successfully! We'll get back to you soon." 
            : "Messaggio inviato con successo! Ti risponderemo presto."
        );
        form.reset();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast.error(
        data.language === "en"
          ? "Failed to send message. Please try again."
          : "Impossibile inviare il messaggio. Riprova."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedLanguage = form.watch("language");

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#0e1924]">
          {selectedLanguage === "en" ? "Send us a Message" : "Inviaci un Messaggio"}
        </CardTitle>
        <CardDescription>
          {selectedLanguage === "en" 
            ? "We'd love to hear from you. Send us a message and we'll respond as soon as possible."
            : "Ci piacerebbe sentire da te. Inviaci un messaggio e ti risponderemo il prima possibile."
          }
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
                    <FormLabel>
                      {selectedLanguage === "en" ? "First Name" : "Nome"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={selectedLanguage === "en" ? "Your first name" : "Il tuo nome"} 
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
                    <FormLabel>
                      {selectedLanguage === "en" ? "Last Name" : "Cognome"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={selectedLanguage === "en" ? "Your last name" : "Il tuo cognome"} 
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
                  <FormLabel>
                    {selectedLanguage === "en" ? "Email Address" : "Indirizzo Email"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder={selectedLanguage === "en" ? "your.email@example.com" : "tua.email@esempio.com"} 
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
                  <FormLabel>
                    {selectedLanguage === "en" ? "Subject" : "Oggetto"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            selectedLanguage === "en" 
                              ? "Select a subject" 
                              : "Seleziona un oggetto"
                          } 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="order">
                        {selectedLanguage === "en" ? "Order Inquiry" : "Richiesta Ordine"}
                      </SelectItem>
                      <SelectItem value="product">
                        {selectedLanguage === "en" ? "Product Question" : "Domanda Prodotto"}
                      </SelectItem>
                      <SelectItem value="order">
                        {selectedLanguage === "en" ? "Order & Delivery" : "Ordine e Consegna"}
                      </SelectItem>
                      <SelectItem value="returns">
                        {selectedLanguage === "en" ? "Returns & Exchanges" : "Resi e Cambi"}
                      </SelectItem>
                      <SelectItem value="sizing">
                        {selectedLanguage === "en" ? "Sizing Help" : "Aiuto Taglie"}
                      </SelectItem>
                      <SelectItem value="other">
                        {selectedLanguage === "en" ? "Other" : "Altro"}
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
                  <FormLabel>
                    {selectedLanguage === "en" ? "Preferred Language" : "Lingua Preferita"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    {selectedLanguage === "en" 
                      ? "We'll respond in your preferred language."
                      : "Ti risponderemo nella tua lingua preferita."
                    }
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
                  <FormLabel>
                    {selectedLanguage === "en" ? "Message" : "Messaggio"}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={5}
                      placeholder={
                        selectedLanguage === "en" 
                          ? "Tell us how we can help you..." 
                          : "Raccontaci come possiamo aiutarti..."
                      }
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
                  <span>
                    {selectedLanguage === "en" ? "Sending..." : "Invio..."}
                  </span>
                </div>
              ) : (
                <span>
                  {selectedLanguage === "en" ? "Send Message" : "Invia Messaggio"}
                </span>
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
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#0e1924] flex items-center">
          <Mail className="h-6 w-6 mr-2 text-[#f5963c]" />
          Follow Us on Social Media
        </CardTitle>
        <CardDescription>
          Stay connected with Goal Mania for the latest football news, jersey updates, and exclusive offers.
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
            <span className="font-semibold">Instagram</span>
          </a>
          
          <a 
            href="https://x.com/goalmania_" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 bg-black rounded-lg text-white hover:bg-gray-800 transition-all duration-200"
          >
            <Twitter className="h-6 w-6" />
            <span className="font-semibold">Twitter</span>
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
            <span className="font-semibold">TikTok</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// Main contact page component
export default function ContactPage() {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold mb-6 text-black">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our football jerseys or need assistance? We're here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-[#0e1924]">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Our team is dedicated to providing you with the best football jersey experience. 
                Whether you have questions about sizing, orders, or our products, we're here to help.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-[#f5963c] text-white">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Support
                </Badge>
                <span className="text-sm text-gray-600">24/7 customer support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-[#0e1924] text-white">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Secure
                </Badge>
                <span className="text-sm text-gray-600">SSL encrypted forms</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-green-600 text-white">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Fast Response
                </Badge>
                <span className="text-sm text-gray-600">Response within 24 hours</span>
              </div>
            </div>

            {/* Social Media */}
            <SocialMediaSection />
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
} 