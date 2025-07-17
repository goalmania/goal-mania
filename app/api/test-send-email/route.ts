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
  try {
    const body = await req.json();
    const { to, template, params }: { to: string; template: TemplateKey; params: Record<string, any> } = body;

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

    // Generate email content using the selected template
    const { subject, text, html } = templates[template](params as any);

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