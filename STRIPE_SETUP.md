# Stripe Integration Setup Guide

## Environment Variables

Make sure your `.env.local` file contains the following variables:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Setting Up Webhooks for Local Development

1. Install the Stripe CLI from https://stripe.com/docs/stripe-cli

2. Login to your Stripe account:

```
stripe login
```

3. Start forwarding webhook events to your local server:

```
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

4. The CLI will display a webhook signing secret. Add this to your `.env.local` file:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Restart your Next.js development server:

```
npm run dev
```

## Testing Webhooks

You can trigger test webhook events using the Stripe CLI:

```
stripe trigger payment_intent.succeeded
```

## Troubleshooting

If orders aren't being created after payment:

1. Check that your webhook is properly configured
2. Visit `/api/test/webhook-status` to verify configuration
3. Check server logs for any errors in the webhook handler
4. Make sure the MongoDB connection is working properly

## Production Setup

For production, set up a webhook endpoint in the Stripe Dashboard:

1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Get the signing secret and add it to your production environment variables
