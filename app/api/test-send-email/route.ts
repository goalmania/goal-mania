import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/utils/email";
import {
  orderConfirmationTemplate,
  shippingNotificationTemplate,
  orderStatusUpdateTemplate,
} from "@/lib/utils/email-templates";

const templates = {
  orderConfirmation: orderConfirmationTemplate,
  shippingNotification: shippingNotificationTemplate,
  orderStatusUpdate: orderStatusUpdateTemplate,
};

type TemplateKey = keyof typeof templates;

export async function POST(req: NextRequest) {
  // Endpoint scoperto senza autenticazione il 22/9/2026: chiunque poteva
  // mandare email arbitrarie a chiunque usando il Brevo del sito (rischio
  // spam/reputazione mittente). Stesso schema x-admin-token delle altre
  // route admin.
  const token = req.headers.get("x-admin-token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { to, template, params, language = 'it' }: { 
      to: string; 
      template: TemplateKey; 
      params: Record<string, any>;
      language?: 'it' | 'en';
    } = body;

    if (!to || !template || !templates[template]) {
      return NextResponse.json(
        { error: "Missing or invalid 'to' or 'template' parameter" },
        { status: 400 }
      );
    }

    // Validate required params for each template
    if (template === "orderConfirmation") {
      if (!params.orderId || typeof params.amount !== "number") {
        return NextResponse.json(
          { error: "Missing required params: orderId, amount" },
          { status: 400 }
        );
      }
    } else if (template === "shippingNotification") {
      if (!params.orderId || !params.trackingCode) {
        return NextResponse.json(
          { error: "Missing required params: orderId, trackingCode" },
          { status: 400 }
        );
      }
    } else if (template === "orderStatusUpdate") {
      if (!params.orderId || !params.status) {
        return NextResponse.json(
          { error: "Missing required params: orderId, status" },
          { status: 400 }
        );
      }
    }

    // Generate email content using the selected template with language support
    const { subject, text, html } = await templates[template]({ ...params, language } as any);

    // Send the email
    const result = await sendEmail({ to, subject, text, html });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 