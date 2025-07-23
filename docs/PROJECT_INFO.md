# Goal Mania - Project Information

## Project Overview
Goal Mania is a football (soccer)-themed e-commerce platform that combines online shopping for football merchandise with content features like news, fantasy tips, live matches, and league information.

## Tech Stack
- **Frontend**: Next.js 15.3.2 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: Zustand for cart/wishlist, Tanstack Query for data fetching
- **Authentication**: NextAuth.js with MongoDB adapter
- **Database**: MongoDB with Mongoose ODM
- **Payment Processing**: Stripe and Mollie integration
- **Hosting**: Vercel
- **External APIs**: Football data APIs for live matches, fixtures, standings

## Main Sections & Features

### 1. Homepage (`app/page.tsx`)
- Entry point displaying featured articles/news
- Fetches content from MongoDB Article model
- Shows "In Evidenza" (featured highlights)

### 2. Shop Section (`app/shop/`)
- Core e-commerce functionality
- Product categories: 2024/25, 2025/26, Retro, Serie A, International
- Cart management with Zustand
- Product details and reviews
- Payment integration with Stripe/Mollie

### 3. News & Content (`app/news/`, `/transfer/`, `/serieA/`, `/international/`)
- Football news and updates
- Articles from MongoDB Article model
- League-specific information
- Live matches integration

### 4. Fantasy Football (`app/fantasyFootball/`)
- Fantasy league management
- Live matches display
- Editable fantasy tips
- League tabs (Serie A, Premier League, etc.)

### 5. Admin Panel (`app/admin/`)
- Dashboard with analytics
- Product/Article/User/Coupon management
- Order tracking and management
- Role-based access control

### 6. User Features
- Profile management (`app/profile/`)
- Order history (`app/account/orders/`)
- Wishlist functionality
- Cart and checkout process

## Database Models
- **User**: Authentication and profile data
- **Product**: E-commerce items (jerseys, merchandise)
- **Order**: Purchase transactions
- **Article**: News and content
- **Review**: Product reviews
- **Coupon**: Discount codes

## API Routes (`app/api/`)
- Authentication endpoints
- Product CRUD operations
- Order management
- Payment webhooks
- External football data integration
- Analytics and reporting

## Key Components
- **Layout**: Header, footer, navigation
- **Shop**: Product grids, cart, checkout
- **Content**: Article displays, news sliders
- **Admin**: Management interfaces
- **UI**: shadcn/ui components (buttons, cards, tabs, etc.)

## Development Setup
1. Clone repository
2. Run `npm install`
3. Create `.env.local` with required environment variables:
   - MONGODB_URI
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - Stripe keys
   - Google OAuth credentials
4. Run `npm run dev` for development
5. Use seed scripts for sample data

## Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run seed:products`: Seed product data
- `npm run seed:all`: Seed all sample data

## Current Status
- Functional e-commerce platform
- Admin panel operational
- Payment processing integrated
- Content management working
- Ready for UI/UX improvements and optimizations

## Areas for Improvement (from TASK.md)
1. General UI improvements (styling, responsiveness)
2. Post-order experience enhancement
3. Admin order management optimization
4. Speed and performance improvements
5. Homepage conversion optimization 