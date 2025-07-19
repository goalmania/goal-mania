// lib/utils/email-templates.ts
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';

// Template loading utility with language support
function loadTemplate(templateName: string, language: 'it' | 'en' = 'it'): string {
  const templatePath = path.join(process.cwd(), 'lib', 'utils', 'email-templates', language, `${templateName}.html`);
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to load template: ${templateName} for language: ${language}`, error);
    // Fallback to Italian if English template not found
    if (language === 'en') {
      return loadTemplate(templateName, 'it');
    }
    return '';
  }
}

// Variable replacement utility
function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  
  // Replace environment variables first
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://goal-mania.vercel.app';
  result = result.replace(/\{\{NEXT_PUBLIC_BASE_URL\}\}/g, baseUrl);
  
  // Replace other variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return result;
}

// Fetch product details and create product cards HTML
async function generateProductCards(items: any[], language: 'it' | 'en' = 'it'): Promise<string> {
  try {
    await connectDB();
    
    const productCards = await Promise.all(
      items.map(async (item) => {
        let productDetails = null;
        
        // Try to fetch product details if productId exists
        if (item.productId) {
          productDetails = await Product.findById(item.productId).lean();
        }
        
        // Use product details if available, otherwise use item data
        const product: any = productDetails || {
          title: item.name,
          images: ['/product/product-placeholder-img.jpg'],
          description: item.name,
          basePrice: item.price,
          isRetro: false,
          isMysteryBox: false,
          category: 'serie-a'
        };
        
        const imageUrl = product.images && product.images.length > 0 
          ? product.images[0] 
          : '/product/product-placeholder-img.jpg';
        
        const productType = product.isMysteryBox ? '🎁 Mystery Box' : 
                           product.isRetro ? '🏆 Retro' : '⚽ Jersey';
        
        const customizationText = item.customization ? [
          item.customization.size && `${language === 'it' ? 'Taglia' : 'Size'}: ${item.customization.size}`,
          item.customization.name && `${language === 'it' ? 'Nome' : 'Name'}: ${item.customization.name}`,
          item.customization.number && `${language === 'it' ? 'Numero' : 'Number'}: ${item.customization.number}`,
          item.customization.includeShorts && `${language === 'it' ? 'Con Pantaloncini' : 'With Shorts'}`,
          item.customization.includeSocks && `${language === 'it' ? 'Con Calzini' : 'With Socks'}`,
          item.customization.isPlayerEdition && `${language === 'it' ? 'Edizione Giocatore' : 'Player Edition'}`,
          item.customization.selectedPatches && item.customization.selectedPatches.length > 0 && 
            `${language === 'it' ? 'Patch' : 'Patches'}: ${item.customization.selectedPatches.map((p: any) => p.name).join(', ')}`
        ].filter(Boolean).join(' • ') : '';
        
        return `
          <div style="
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          ">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 80px;
                height: 80px;
                background: #f8fafc;
                border-radius: 8px;
                margin-right: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              ">
                <img src="${imageUrl}" alt="${product.title}" style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                " />
              </div>
              <div style="flex: 1;">
                <div style="
                  background: ${product.isMysteryBox ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 
                               product.isRetro ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
                               'linear-gradient(135deg, #0e1924 0%, #1a365d 100%)'};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;
                  display: inline-block;
                  margin-bottom: 8px;
                ">
                  ${productType}
                </div>
                <h4 style="
                  color: #0e1924;
                  margin: 0 0 5px 0;
                  font-size: 16px;
                  font-weight: 600;
                  line-height: 1.3;
                ">${product.title}</h4>
                ${customizationText ? `
                  <p style="
                    color: #64748b;
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    line-height: 1.4;
                  ">${customizationText}</p>
                ` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="
                    color: #0e1924;
                    font-weight: 700;
                    font-size: 16px;
                  ">€${item.price.toFixed(2)}</span>
                  <span style="
                    color: #64748b;
                    font-size: 14px;
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 4px;
                  ">${language === 'it' ? 'Quantità' : 'Qty'}: ${item.quantity}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      })
    );
    
    return productCards.join('');
  } catch (error) {
    console.error('Error generating product cards:', error);
    return '';
  }
}

export async function orderConfirmationTemplate({ 
  userName, 
  orderId, 
  amount, 
  items = [],
  language = 'it' 
}: { 
  userName?: string; 
  orderId: string; 
  amount: number; 
  items?: any[];
  language?: 'it' | 'en';
}) {
  // Generate product cards HTML
  const productCardsHtml = await generateProductCards(items, language);
  
  const template = loadTemplate('order-confirmation', language);
  const html = replaceVariables(template, {
    userName: userName || '',
    orderId,
    amount,
    productCards: productCardsHtml
  });

  const subjects = {
    it: "🎉 Ordine Confermato! La tua maglia Goal Mania è in arrivo",
    en: "🎉 Order Confirmed! Your Goal Mania Jersey is on its way"
  };

  const texts = {
    it: `Ciao${userName ? ' ' + userName : ''},\n\n🎉 SCELTA ECCELLENTE! Il tuo ordine è stato confermato e stiamo già lavorando su di esso.\n\n📦 Dettagli Ordine:\nOrdine #: ${orderId}\nTotale: €${amount}\n\n⚡ Prossimi Passi:\n- Processeremo il tuo ordine entro 24 ore\n- Riceverai conferma di spedizione con tracking\n- La consegna richiede 3-5 giorni lavorativi\n\n🏆 Grazie per aver scelto Goal Mania!\n\nCordiali saluti,\nIl Team Goal Mania`,
    en: `Hi${userName ? ' ' + userName : ''},\n\n🎉 EXCELLENT CHOICE! Your order has been confirmed and we're already working on it.\n\n📦 Order Details:\nOrder #: ${orderId}\nTotal: €${amount}\n\n⚡ What's Next:\n- We'll process your order within 24 hours\n- You'll get shipping confirmation with tracking\n- Delivery typically takes 3-5 business days\n\n🏆 Thank you for choosing Goal Mania!\n\nBest regards,\nThe Goal Mania Team`
  };

  return {
    subject: subjects[language],
    text: texts[language],
    html
  };
}

export async function shippingNotificationTemplate({ 
  userName, 
  orderId, 
  trackingCode, 
  items = [],
  language = 'it' 
}: { 
  userName?: string; 
  orderId: string; 
  trackingCode: string; 
  items?: any[];
  language?: 'it' | 'en';
}) {
  // Generate product cards HTML
  const productCardsHtml = await generateProductCards(items, language);
  
  const template = loadTemplate('shipping-notification', language);
  const html = replaceVariables(template, {
    userName: userName || '',
    orderId,
    trackingCode,
    productCards: productCardsHtml
  });

  const subjects = {
    it: "🚚 La tua maglia Goal Mania è in movimento!",
    en: "🚚 Your Goal Mania Jersey is on the move!"
  };

  const texts = {
    it: `Ciao${userName ? ' ' + userName : ''},\n\n🚚 NOTIZIE EMOZIONANTI! Il tuo ordine è stato spedito e sta arrivando da te!\n\n📦 Ordine #: ${orderId}\n📋 Tracking: ${trackingCode}\n\n🎯 Traccia il tuo pacco in tempo reale e ricevi aggiornamenti sulla consegna.\n\n⚡ Consegna stimata: 3-5 giorni lavorativi\n\n🏆 Grazie per aver scelto Goal Mania!\n\nCordiali saluti,\nIl Team Goal Mania`,
    en: `Hi${userName ? ' ' + userName : ''},\n\n🚚 EXCITING NEWS! Your order has been shipped and is on its way to you!\n\n📦 Order #: ${orderId}\n📋 Tracking: ${trackingCode}\n\n🎯 Track your package in real-time and get delivery updates.\n\n⚡ Estimated delivery: 3-5 business days\n\n🏆 Thank you for choosing Goal Mania!\n\nBest regards,\nThe Goal Mania Team`
  };

  return {
    subject: subjects[language],
    text: texts[language],
    html
  };
}

export async function orderStatusUpdateTemplate({ 
  userName, 
  orderId, 
  status, 
  statusHistory, 
  items = [],
  language = 'it' 
}: {
  userName?: string;
  orderId: string;
  status: string;
  statusHistory?: string[];
  items?: any[];
  language?: 'it' | 'en';
}) {
  // Define the order journey with icons
  const steps = [
    { name: "Pending", icon: "⏳", color: "#6b7280" },
    { name: "Processing", icon: "⚙️", color: "#3b82f6" },
    { name: "Shipped", icon: "🚚", color: "#059669" },
    { name: "Delivered", icon: "✅", color: "#059669" },
    { name: "Cancelled", icon: "❌", color: "#dc2626" }
  ];
  
  // Find the current step index
  const currentStep = steps.findIndex(
    (step) => step.name.toLowerCase() === status.toLowerCase()
  );
  
  // Get status-specific styling
  const getStatusStyle = () => {
    switch(status.toLowerCase()) {
      case 'pending':
        return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' };
      case 'processing':
        return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
      case 'shipped':
        return { bg: '#ecfdf5', border: '#059669', text: '#065f46' };
      case 'delivered':
        return { bg: '#ecfdf5', border: '#059669', text: '#065f46' };
      case 'cancelled':
        return { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' };
      default:
        return { bg: '#f8fafc', border: '#64748b', text: '#374151' };
    }
  };
  
  const statusStyle = getStatusStyle();

  // Generate steps HTML with table-based layout for email compatibility
  const stepsHtml = steps.map((step, idx) => {
    const isActive = idx <= currentStep && currentStep !== 4;
    const isCancelled = currentStep === 4;
    const isCurrent = idx === currentStep;
    const stepColor = isCancelled && idx === 4 ? '#dc2626' : isActive ? '#0e1924' : '#e2e8f0';
    const textColor = isActive ? '#0e1924' : '#94a3b8';
    const borderColor = isActive && !isCancelled ? '#0e1924' : '#e2e8f0';
    
    return `
      <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
        <tr>
          <td style="width: 50px; vertical-align: top; padding-top: 4px;">
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: ${stepColor};
              color: white;
              text-align: center;
              line-height: 40px;
              font-size: 18px;
              font-weight: bold;
              margin: 0 auto;
              box-shadow: ${isCurrent ? '0 0 0 4px rgba(14, 25, 36, 0.1)' : 'none'};
              border: ${isCurrent ? '2px solid #0e1924' : 'none'};
            ">
              ${step.icon}
            </div>
          </td>
          <td style="vertical-align: top; padding-left: 20px;">
            <div style="color: ${textColor}; font-weight: ${isActive ? '600' : '400'}; font-size: 16px; margin-bottom: 4px;">${step.name}</div>
            ${isCurrent ? `<div style="color: #f5963c; font-size: 14px; font-weight: 600;">Current Status</div>` : ''}
          </td>
        </tr>
      </table>
      ${idx < steps.length - 1 ? `
        <div style="
          width: 100%;
          height: 4px;
          background: ${borderColor};
          margin: 15px 0;
          border-radius: 2px;
          max-width: 200px;
          margin-left: 20px;
        "></div>
      ` : ''}
    `;
  }).join('');

  // Generate product cards HTML
  const productCardsHtml = await generateProductCards(items, language);
  
  const template = loadTemplate('order-status-update', language);
  const html = replaceVariables(template, {
    userName: userName || '',
    orderId,
    status,
    statusBg: statusStyle.bg,
    statusBorder: statusStyle.border,
    statusText: statusStyle.text,
    stepsHtml,
    productCards: productCardsHtml
  });

  const subjects = {
    it: `📊 Aggiornamento Stato Ordine: ${status} (Ordine #${orderId})`,
    en: `📊 Order Status Update: ${status} (Order #${orderId})`
  };

  const texts = {
    it: `Ciao${userName ? ' ' + userName : ''},\n\n📊 Lo stato del tuo ordine #${orderId} è stato aggiornato a: ${status}.\n\nStato Attuale: ${status}\nNumero Ordine: #${orderId}\n\nTraccia il progresso del tuo ordine e ricevi aggiornamenti in tempo reale.\n\nGrazie per aver scelto Goal Mania!\n\nCordiali saluti,\nIl Team Goal Mania`,
    en: `Hi${userName ? ' ' + userName : ''},\n\n📊 Your order #${orderId} status has been updated to: ${status}.\n\nCurrent Status: ${status}\nOrder Number: #${orderId}\n\nTrack your order progress and get real-time updates.\n\nThank you for shopping with Goal Mania!\n\nBest regards,\nThe Goal Mania Team`
  };

  return {
    subject: subjects[language],
    text: texts[language],
    html
  };
} 