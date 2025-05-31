# Goal Mania - E-commerce Platform

A modern e-commerce platform built with Next.js, TypeScript, and MongoDB.

## Features

- 🔐 Secure authentication with NextAuth.js
- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart management
- 💳 Secure payments with Stripe
- 📦 Order tracking and management
- 👤 User profile management
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Payment Processing**: Stripe
- **Form Validation**: Zod
- **API**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB database
- Stripe account
- Google OAuth credentials (for social login)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/goal-mania.git
   cd goal-mania
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting up Stripe Webhooks

1. Install the Stripe CLI
2. Run the following command to forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Project Structure

```
goal-mania/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── orders/            # Order management
│   ├── products/          # Product catalog
│   └── profile/           # User profile
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utility functions
│   ├── db.ts             # Database configuration
│   └── store/            # Zustand stores
├── public/               # Static files
└── types/                # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe](https://stripe.com/)
- [MongoDB](https://www.mongodb.com/)
