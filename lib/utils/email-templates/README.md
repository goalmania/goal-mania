# Email Templates - Goal Mania

This directory contains email templates organized by language for the Goal Mania e-commerce platform.

## 📁 Directory Structure

```
email-templates/
├── it/                    # Italian templates (default language)
│   ├── order-confirmation.html
│   ├── shipping-notification.html
│   └── order-status-update.html
├── en/                    # English templates (requires language flag)
│   ├── order-confirmation.html
│   ├── shipping-notification.html
│   └── order-status-update.html
└── README.md
```

## 🌍 Language Support

- **Italian (it)**: Default language - used when no language is specified
- **English (en)**: Requires explicit language flag `language: 'en'`

## 📧 Available Templates

### 1. Order Confirmation (`order-confirmation.html`)
**Purpose**: Sent when an order is successfully placed and confirmed.

**Variables**:
- `{{userName}}` - Customer's name (optional)
- `{{orderId}}` - Order number
- `{{amount}}` - Total order amount

**Usage**:
```typescript
// Italian (default)
orderConfirmationTemplate({ userName, orderId, amount })

// English
orderConfirmationTemplate({ userName, orderId, amount, language: 'en' })
```

### 2. Shipping Notification (`shipping-notification.html`)
**Purpose**: Sent when an order is shipped with tracking information.

**Variables**:
- `{{userName}}` - Customer's name (optional)
- `{{orderId}}` - Order number
- `{{trackingCode}}` - Shipping tracking number

**Usage**:
```typescript
// Italian (default)
shippingNotificationTemplate({ userName, orderId, trackingCode })

// English
shippingNotificationTemplate({ userName, orderId, trackingCode, language: 'en' })
```

### 3. Order Status Update (`order-status-update.html`)
**Purpose**: Sent when order status changes (processing, shipped, delivered, etc.).

**Variables**:
- `{{userName}}` - Customer's name (optional)
- `{{orderId}}` - Order number
- `{{status}}` - Current order status
- `{{statusBg}}` - Status background color
- `{{statusBorder}}` - Status border color
- `{{statusText}}` - Status text color
- `{{stepsHtml}}` - Dynamically generated progress timeline

**Usage**:
```typescript
// Italian (default)
orderStatusUpdateTemplate({ userName, orderId, status, statusHistory })

// English
orderStatusUpdateTemplate({ userName, orderId, status, statusHistory, language: 'en' })
```

## 🎨 Design Features

### Premium Sports Merchandise Vibe
- **Spacious Layout**: Generous padding and margins for premium feel
- **Table-Based Layout**: Perfect email client compatibility
- **Brand Colors**: Consistent use of Goal Mania brand colors
- **Professional Typography**: Enhanced font weights and sizes
- **Visual Progress Indicators**: Dynamic timelines and progress bars

### Email Client Compatibility
- **Inline CSS**: Maximum compatibility across all email clients
- **Table Layouts**: Works perfectly in Outlook, Gmail, Apple Mail
- **Responsive Design**: Looks great on mobile and desktop
- **Cross-Platform**: Consistent rendering everywhere

## 🔧 Maintenance Guidelines

### Adding New Templates
1. Create the template in both `it/` and `en/` directories
2. Use consistent variable naming with `{{variableName}}`
3. Follow the existing design patterns and spacing
4. Test across multiple email clients

### Updating Existing Templates
1. Update both language versions simultaneously
2. Maintain consistent variable placeholders
3. Test the template loading and variable replacement
4. Verify email client rendering

### Language Support
- **Italian is default**: No language parameter needed
- **English requires flag**: Pass `language: 'en'` parameter
- **Fallback system**: If English template not found, falls back to Italian
- **Consistent translations**: Keep both versions in sync

## 🚀 Usage Examples

```typescript
import { 
  orderConfirmationTemplate, 
  shippingNotificationTemplate, 
  orderStatusUpdateTemplate 
} from '@/lib/utils/email-templates';

// Italian templates (default)
const italianOrderConfirmation = orderConfirmationTemplate({
  userName: "Mario Rossi",
  orderId: "ORD-12345",
  amount: 89.99
});

// English templates (explicit)
const englishShippingNotification = shippingNotificationTemplate({
  userName: "John Smith",
  orderId: "ORD-12345",
  trackingCode: "TRK-789012",
  language: 'en'
});

// Order status update
const statusUpdate = orderStatusUpdateTemplate({
  userName: "Mario Rossi",
  orderId: "ORD-12345",
  status: "Shipped",
  statusHistory: ["Pending", "Processing", "Shipped"]
});
```

## 📱 Template Features

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly buttons and links

### Visual Elements
- **Progress Indicators**: Visual timelines for order status
- **Status Cards**: Color-coded status information
- **CTA Buttons**: Clear call-to-action buttons
- **Brand Elements**: Consistent Goal Mania branding

### Accessibility
- High contrast colors
- Clear typography
- Semantic HTML structure
- Alt text for images (when added)

## 🔄 Template Loading System

The template loading system automatically:
- Loads templates from the correct language directory
- Falls back to Italian if English template not found
- Replaces all variables with actual values
- Handles missing templates gracefully
- Provides detailed error logging 