// Email templates for various cases

export function orderConfirmationTemplate({ userName, orderId, amount }: { userName?: string; orderId: string; amount: number }) {
  return {
    subject: "Order Confirmation - Goal Mania",
    text: `Hi${userName ? ' ' + userName : ''},\n\nThank you for your order! Your order #${orderId} has been received and is being processed.\n\nOrder Total: €${amount}\n\nWe'll notify you when your order ships.\n\nThank you for shopping with us!`,
    html: `<p>Hi${userName ? ' ' + userName : ''},</p><p>Thank you for your order! <b>Your order #${orderId}</b> has been received and is being processed.</p><p><b>Order Total:</b> €${amount}</p><p>We'll notify you when your order ships.</p><p>Thank you for shopping with us!</p>`
  };
}

export function shippingNotificationTemplate({ userName, orderId, trackingCode }: { userName?: string; orderId: string; trackingCode: string }) {
  return {
    subject: "Your Order Has Been Shipped!",
    text: `Hi${userName ? ' ' + userName : ''},\n\nYour order #${orderId} has been shipped!\nTracking Number: ${trackingCode}\n\nThank you for shopping with us!`,
    html: `<p>Hi${userName ? ' ' + userName : ''},</p><p>Your order <b>#${orderId}</b> has been shipped!</p><p><b>Tracking Number:</b> <strong>${trackingCode}</strong></p><p>Thank you for shopping with us!</p>`
  };
}

export function orderStatusUpdateTemplate({ userName, orderId, status, statusHistory }: {
  userName?: string;
  orderId: string;
  status: string;
  statusHistory?: string[];
}) {
  // Define the order journey
  const steps = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  // Find the current step index
  const currentStep = steps.findIndex(
    (step) => step.toLowerCase() === status.toLowerCase()
  );
  // Build progress bar HTML
  const progressBar = `
    <div style="display: flex; align-items: center; margin: 24px 0;">
      ${steps
        .map((step, idx) => {
          const isActive = idx <= currentStep && currentStep !== 4;
          const isCancelled = currentStep === 4;
          return `
            <div style="display: flex; align-items: center;">
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: ${isCancelled && idx === 4 ? '#e53e3e' : isActive ? '#0e1924' : '#e2e8f0'};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;">
                ${idx + 1}
              </div>
              ${idx < steps.length - 1 ? `<div style="width: 40px; height: 4px; background: ${isActive && !isCancelled ? '#0e1924' : '#e2e8f0'};"></div>` : ''}
            </div>
          `;
        })
        .join('')}
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 16px;">
      ${steps
        .map(
          (step) => `<span style="width: 68px; text-align: center;">${step}</span>`
        )
        .join('')}
    </div>
  `;

  return {
    subject: `Order Status Update - ${status} (Order #${orderId})`,
    text: `Hi${userName ? ' ' + userName : ''},\n\nYour order #${orderId} status has been updated to: ${status}.\n\nThank you for shopping with us!`,
    html: `
      <p>Hi${userName ? ' ' + userName : ''},</p>
      <p>Your order <b>#${orderId}</b> status has been updated to: <b>${status}</b>.</p>
      ${progressBar}
      <p>Thank you for shopping with us!</p>
    `,
  };
} 