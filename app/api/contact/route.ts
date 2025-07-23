import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/utils/email";
import { contactFormSubmissionTemplate, contactAutoReplyTemplate } from "@/lib/utils/email-templates";

// Validation schema for the contact form
const contactSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
  language: z.enum(["en", "it"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = contactSchema.parse(body);
    

    
    // Generate email templates
    const adminEmailTemplate = await contactFormSubmissionTemplate({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      language: validatedData.language
    });

    const autoReplyTemplate = await contactAutoReplyTemplate({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      language: validatedData.language
    });

    // Send email to admin
    const adminEmailResult = await sendEmail({
      to: "admin@goalmania.com", // Replace with actual admin email
      subject: adminEmailTemplate.subject,
      text: adminEmailTemplate.text,
      html: adminEmailTemplate.html
    });
    
    // Send auto-reply to customer
    const autoReplyResult = await sendEmail({
      to: validatedData.email,
      subject: autoReplyTemplate.subject,
      text: autoReplyTemplate.text,
      html: autoReplyTemplate.html
    });
    
    // Log the results (optional)
    console.log("Admin email sent:", adminEmailResult);
    console.log("Auto-reply sent:", autoReplyResult);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Message sent successfully" 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to send message. Please try again." 
      },
      { status: 500 }
    );
  }
} 