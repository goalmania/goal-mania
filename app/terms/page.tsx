import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Goal Mania",
  description: "Terms and conditions for Goal Mania football jersey purchases and services.",
};

export default function TermsPage() {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold mb-6 text-black">Terms & Conditions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms and conditions carefully before using our website or making a purchase.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Goal Mania's website, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Goal Mania's website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on Goal Mania's website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">3. Product Information</h2>
              <p className="text-gray-700 mb-4">
                We strive to display our products as accurately as possible. However, we do not warrant that product descriptions, colors, 
                information, or other content available on the site is accurate, complete, reliable, current, or error-free.
              </p>
              <p className="text-gray-700 mb-4">
                All football jerseys are official licensed products unless otherwise stated. Product images are for illustrative purposes only.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">4. Pricing and Payment</h2>
              <p className="text-gray-700 mb-4">
                All prices are shown in Euros (€) and include VAT where applicable. We reserve the right to modify prices at any time.
                Payment must be made in full at the time of ordering.
              </p>
              <p className="text-gray-700 mb-4">
                We accept major credit cards, PayPal, and other payment methods as displayed during checkout. 
                All transactions are secure and encrypted.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">5. Order and Delivery</h2>
              <p className="text-gray-700 mb-4">
                We offer free delivery on all orders within Italy. For international orders, delivery costs will be calculated at checkout.
                Delivery times are estimates and may vary based on location and availability.
              </p>
              <p className="text-gray-700 mb-4">
                Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">6. Returns and Refunds</h2>
              <p className="text-gray-700 mb-4">
                We accept returns within 7 days of delivery. Items must be:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Unworn and in original condition</li>
                <li>In original packaging with all tags attached</li>
                <li>Accompanied by proof of purchase</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Refunds will be processed within 14 business days of receiving the returned item. 
                Return delivery costs are the responsibility of the customer unless the item is defective.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, 
                to understand our practices regarding the collection and use of your personal information.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The content on this website, including but not limited to text, graphics, images, logos, and software, 
                is the property of Goal Mania and is protected by copyright laws.
              </p>
              <p className="text-gray-700 mb-4">
                Football team names, logos, and related trademarks are the property of their respective owners.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Goal Mania or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use the materials on Goal Mania's website.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of Italy. 
                Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction 
                of the courts of Italy.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms and conditions at any time. Changes will be effective 
                immediately upon posting on the website. Your continued use of the website constitutes acceptance of the modified terms.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0e1924] mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
                             <div className="bg-gray-50 p-4 rounded-lg">
                 <p className="text-gray-700">
                   <strong>Email:</strong> legal@goalmania.com<br />
                   <strong>Location:</strong> Italy<br />
                   <strong>Contact:</strong> Please use the contact form above
                 </p>
               </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: December 2024<br />
                © 2025 Goal Mania. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 