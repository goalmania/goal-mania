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
- 🌍 Internationalization (i18n) support
- 📊 Admin dashboard with analytics
- 📝 Rich text editor for content management
- 🎯 Fantasy football features
- 📰 News and articles system

## Tech Stack

- **Frontend**: Next.js 15.3.2, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui, Radix UI
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Payment Processing**: Stripe
- **Form Validation**: Zod, React Hook Form
- **API**: Next.js API Routes
- **Internationalization**: i18next, react-i18next
- **UI Components**: Radix UI, Lucide React, Framer Motion
- **Data Fetching**: SWR, TanStack Query
- **Rich Text Editor**: TipTap
- **Charts**: Recharts
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB database
- Stripe account
- Google OAuth credentials (for social login)
- pnpm (recommended) or npm

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

# Email (for notifications)
EMAIL_SERVER_HOST=your_smtp_host
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=noreply@yourdomain.com
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/goal-mania.git
   cd goal-mania
   ```

2. Install dependencies:

   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. Set up the database:

   ```bash
   # Seed initial data (optional)
   pnpm seed:all
   
   # Or seed specific data
   pnpm seed:products
   pnpm seed:reviews
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database & Data Management
- `pnpm seed:all` - Seed all initial data
- `pnpm seed:products` - Seed product data
- `pnpm seed:reviews` - Seed review data
- `pnpm import:products` - Import products from external source
- `pnpm manual:seed` - Manual seeding with custom data
- `pnpm optimize-db` - Optimize database indexes

### Cache & Performance
- `pnpm revalidate` - Revalidate Next.js cache

### Setting up Stripe Webhooks

1. Install the Stripe CLI
2. Run the following command to forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Database Setup

1. Create a MongoDB database (local or cloud)
2. Update the `MONGODB_URI` in your `.env.local` file
3. Run the database optimization script:
   ```bash
   pnpm optimize-db
   ```

### Initial Data Setup

After setting up the database, you can populate it with initial data:

```bash
# Seed all data at once
pnpm seed:all

# Or seed specific data types
pnpm seed:products
pnpm seed:reviews
```

## Project Structure

```
goal-mania/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── orders/            # Order management
│   ├── products/          # Product catalog
│   ├── profile/           # User profile
│   ├── admin/             # Admin dashboard
│   ├── news/              # News and articles
│   └── fantasyFootball/   # Fantasy football features
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   ├── admin/            # Admin components
│   └── home/             # Homepage components
├── lib/                   # Utility functions
│   ├── db.ts             # Database configuration
│   ├── auth.ts           # Authentication utilities
│   ├── i18n.ts           # Internationalization
│   └── store/            # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
├── public/               # Static files
├── messages/             # i18n translation files
└── scripts/              # Database and utility scripts
```

## Development Workflow

1. **Start Development**: `pnpm dev`
2. **Database Changes**: Update models in `lib/models/`
3. **API Development**: Add routes in `app/api/`
4. **Component Development**: Create components in `components/`
5. **Styling**: Use Tailwind CSS classes and shadcn/ui components
6. **Testing**: Run `pnpm lint` before committing

## Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- Email configuration variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`pnpm install`)
4. Make your changes
5. Run linting (`pnpm lint`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe](https://stripe.com/)
- [MongoDB](https://www.mongodb.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TipTap](https://tiptap.dev/)
