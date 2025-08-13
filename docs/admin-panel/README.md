# Admin Panel Module

## Overview
The admin panel provides comprehensive management capabilities for the Goal-Mania e-commerce platform, including order management, product administration, user management, and analytics.

## Features

### 🔐 Authentication & Access Control
- Role-based access control (Admin/User)
- Secure login with NextAuth.js
- Session management and persistence
- Protected admin routes

### 📊 Dashboard & Analytics
- **Sales Analytics**: Revenue tracking, order statistics
- **Shopify-style Metrics**: 
  - Average Order Value (AOV)
  - Customer Lifetime Value (CLV)
  - Conversion Rate
  - Repeat Customer Rate
- **Performance Charts**: Interactive charts and graphs
- **Real-time Data**: Live updates from database

### 📦 Order Management
- **Order Table**: Complete order listing with filters
- **Order Details**: Products, customer info, shipping address
- **Status Management**: Update order status (New → Shipped → Delivered)
- **Quick Actions**:
  - Print order details
  - Resend confirmation emails
  - Cancel orders
  - Add internal notes
- **Search & Filter**: By order ID, customer name, date range

### 🛍️ Product Management
- **Product CRUD**: Create, read, update, delete products
- **Category Management**: Organize by teams, seasons, types
- **Image Gallery**: Drag-and-drop image uploads
- **Inventory Tracking**: Stock management
- **Mystery Box Management**: Special product type handling

### 👥 User Management
- **User List**: View all registered users
- **Profile Management**: Edit user information
- **Role Assignment**: Admin/User role management
- **Account Status**: Enable/disable accounts

### 📝 Content Management
- **Article Editor**: Rich text formatting
  - Bold, italic, underline
  - Bullet points and numbered lists
  - Text alignment options
- **Article Publishing**: Draft and publish workflow
- **Media Management**: Image and video uploads

### 🎫 Coupon System
- **Coupon Creation**: Generate discount codes
- **Validation Rules**: Usage limits, expiration dates
- **Analytics**: Coupon usage tracking

## Technical Implementation

### File Structure
```
app/(admin)/
├── admin/
│   ├── analytics/          # Sales analytics dashboard
│   ├── articles/           # Content management
│   ├── coupons/            # Discount code management
│   ├── orders/             # Order management
│   ├── products/           # Product administration
│   └── users/              # User management
├── layout.tsx              # Admin layout wrapper
└── page.tsx                # Admin dashboard
```

### Key Components
- `AdminCacheControl.tsx` - Cache management
- `ArticleModal.tsx` - Article editing interface
- `DeleteUserModal.tsx` - User deletion confirmation
- `DraggableImageGallery.tsx` - Product image management

### API Endpoints
- `/api/admin/analytics` - Sales and performance data
- `/api/admin/users` - User management operations
- `/api/admin/coupons` - Coupon CRUD operations
- `/api/orders/[id]` - Order management

### Database Models
- `Order` - Order tracking and management
- `User` - User accounts and roles
- `Product` - Product catalog
- `Article` - Content management
- `Coupon` - Discount codes

## Email Notification System

### Automated Emails
- **Order Confirmation**: Sent immediately after purchase
- **Shipping Notification**: When order status changes to "Shipped"
- **Status Updates**: Progress tracking with visual indicators

### Email Templates
- Professional HTML templates
- Multi-language support (EN/IT)
- Branded styling with Goal-Mania colors
- Responsive design for mobile

### Email Service Setup (Brevo)
**Note**: Email notifications require Brevo service setup by the client.

**Setup Required**:
1. Create Brevo account at [brevo.com](https://brevo.com)
2. Get API key from Brevo dashboard
3. Verify sender email address
4. Configure environment variables:
   ```env
   BREVO_API_KEY=xkeysib-your-api-key-here
   BREVO_SENDER_EMAIL=your-verified-email@domain.com
   ```

## Security Features

### Access Control
- Middleware protection for admin routes
- Session validation
- Role-based permissions
- Secure API endpoints

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token validation

## Mobile Optimization

### Responsive Design
- Mobile-first admin interface
- Touch-friendly controls
- Optimized for tablet and mobile
- Fast loading on all devices

### Mobile Features
- Swipe gestures for navigation
- Touch-optimized buttons and forms
- Mobile-friendly data tables
- Responsive charts and graphs

## Performance Optimizations

### Caching Strategy
- Redis caching for frequently accessed data
- Database query optimization
- Image optimization and CDN
- API response caching

### Loading States
- Skeleton loaders for data tables
- Progress indicators for actions
- Optimistic UI updates
- Error handling and recovery

## Usage Examples

### Creating a New Product
1. Navigate to Admin → Products
2. Click "Add New Product"
3. Fill in product details
4. Upload product images
5. Set pricing and inventory
6. Save and publish

### Managing Orders
1. Go to Admin → Orders
2. View order list with filters
3. Click on order for details
4. Update status as needed
5. Send notifications to customer

### Generating Analytics Report
1. Access Admin → Analytics
2. Select date range
3. View performance metrics
4. Export data if needed
5. Monitor trends over time

## Troubleshooting

### Common Issues
- **Login Loop**: Clear browser cache and cookies
- **Slow Loading**: Check database connection and indexes
- **Email Failures**: Verify email service configuration
- **Permission Errors**: Check user role assignments

### Debug Tools
- Admin cache control panel
- Database connection testing
- API endpoint validation
- Error logging and monitoring

## External Service Setup Requirements

### 📧 Brevo Email Service
**Purpose**: Automated email notifications for orders and customer communications

**Client Setup Required**:
1. **Account Creation**: Sign up at [brevo.com](https://brevo.com)
2. **API Key Generation**: Get API key from Brevo dashboard
3. **Email Verification**: Verify sender email address
4. **Environment Configuration**: Add API key to `.env.local`

**Benefits**:
- Professional email templates
- Delivery tracking and analytics
- Spam protection and deliverability
- Multi-language support

### 📊 Google AdSense
**Purpose**: Revenue generation through display advertisements

**Client Setup Required**:
1. **Account Creation**: Sign up at [adsense.google.com](https://adsense.google.com)
2. **Website Verification**: Add verification code to website
3. **Content Review**: Ensure compliance with AdSense policies
4. **Publisher ID**: Get publisher ID for environment configuration

**Requirements**:
- Original, high-quality content
- Minimum 10,000 monthly page views
- Compliance with AdSense policies
- 1-2 weeks approval process

### 🔍 Google Analytics
**Purpose**: Website traffic and user behavior analytics

**Client Setup Required**:
1. **Account Creation**: Sign up at [analytics.google.com](https://analytics.google.com)
2. **Property Setup**: Configure website property
3. **Measurement ID**: Get tracking ID for environment configuration
4. **Verification**: Confirm data collection is working

### 🗺️ Google Places API
**Purpose**: Address autocomplete in forms

**Client Setup Required**:
1. **Google Cloud Project**: Create or use existing project
2. **API Enablement**: Enable Places API
3. **API Key Creation**: Generate and restrict API key
4. **Domain Configuration**: Add domain restrictions for security

## Future Enhancements

### Planned Features
- Advanced reporting and exports
- Bulk operations for orders/products
- Integration with shipping providers
- Advanced analytics and forecasting
- Multi-language admin interface
- Mobile app for admin functions 