# PayPal Integration for Goal Mania

This document describes the PayPal payment gateway integration implemented in the Goal Mania e-commerce application.

## Overview

The PayPal integration provides customers with an alternative payment method alongside the existing Stripe credit card processing. It follows PayPal's recommended implementation using their JavaScript SDK loaded via script tag, avoiding the need for the full PayPal SDK.

## Features

- **Pay with PayPal Button**: Clean, branded PayPal button that integrates seamlessly with the checkout flow
- **Payment Method Selection**: Users can choose between PayPal and credit card payment methods
- **International Support**: Supports multiple currencies (currently configured for EUR)
- **Secure Processing**: Follows PayPal's security best practices
- **i18n Support**: Fully internationalized with English and Italian translations

## Architecture

### Frontend Components

1. **PaymentStep.tsx**: Main payment component that handles both Stripe and PayPal
2. **PayPalButton.tsx**: Dedicated PayPal button component using PayPal's JavaScript SDK

### Backend API Routes

1. **`/api/paypal/create-order`**: Creates PayPal orders with cart items and address information
2. **`/api/paypal/capture-order`**: Captures payments after user approval

### Payment Flow

1. User selects PayPal as payment method
2. PayPal button is rendered using PayPal's JavaScript SDK
3. User clicks PayPal button and is redirected to PayPal
4. After approval, payment is captured via our API
5. Order is created and user is redirected to success page

## Environment Variables

Add the following to your `.env.local` file:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
```

### Configuration Options

- **`PAYPAL_MODE`**: Set to `sandbox` for testing, `live` for production
- **`NEXT_PUBLIC_PAYPAL_CLIENT_ID`**: Your PayPal application client ID
- **`PAYPAL_CLIENT_SECRET`**: Your PayPal application secret key

## Setup Instructions

### 1. PayPal Developer Account

1. Create a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com)
2. Create a new application to get your client ID and secret
3. Configure your application settings (return URLs, etc.)

### 2. Environment Configuration

1. Copy the environment variables to your `.env.local` file
2. Set `PAYPAL_MODE` to `sandbox` for testing
3. Restart your development server

### 3. Testing

1. Use PayPal's sandbox accounts for testing
2. Test the complete payment flow from cart to order completion
3. Verify webhook handling (if implemented)

## Integration Details

### PayPal Button Rendering

The PayPal button is dynamically rendered using PayPal's JavaScript SDK:

```typescript
window.paypal.Buttons({
  style: {
    layout: "vertical",
    color: "blue",
    shape: "rect",
    label: "pay",
  },
  createOrder: async (data, actions) => {
    // Create order via our API
  },
  onApprove: async (data, actions) => {
    // Capture payment
  },
}).render("#paypal-button-container");
```

### Order Creation

PayPal orders are created with detailed information:

- Cart items with prices and quantities
- Shipping address information
- Coupon/discount details
- Custom metadata for order tracking

### Payment Capture

Payments are captured immediately after user approval, ensuring funds are secured.

## Security Considerations

- **Client ID Exposure**: The PayPal client ID is public and safe to expose
- **Secret Key Protection**: The PayPal secret key is server-side only
- **HTTPS Required**: PayPal requires HTTPS in production
- **Webhook Verification**: Implement webhook signature verification for production

## Troubleshooting

### Common Issues

1. **PayPal Button Not Loading**
   - Check if PayPal script is loading correctly
   - Verify client ID is correct
   - Check browser console for errors

2. **Payment Creation Fails**
   - Verify PayPal credentials
   - Check server logs for API errors
   - Ensure all required fields are provided

3. **Payment Capture Issues**
   - Verify order ID is valid
   - Check PayPal account status
   - Review PayPal API response

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed error information.

## Future Enhancements

- **Webhook Integration**: Real-time payment status updates
- **Subscription Support**: Recurring payments
- **Multiple Currencies**: Support for additional currencies
- **Advanced Fraud Protection**: Enhanced security measures

## Support

For PayPal-specific issues, refer to:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Support](https://www.paypal.com/support/)

For application-specific issues, check the application logs and error handling.
