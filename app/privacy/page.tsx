import { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "GoalMania Privacy Policy",
  description: "Privacy policy and data protection information for GoalMania customers.",
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader eyebrow="Informazioni legali" title="Privacy" lead="Come trattiamo i tuoi dati personali." />
      <div className="mx-auto w-full max-w-[1760px] px-5 pb-16 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[920px] rounded-3xl bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)] md:p-10">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">1. Information We Collect</h2>
              <p className="text-[var(--text-2)] mb-4">
                We collect information you provide directly to us, such as when you create an account, make a purchase, 
                or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li>Name, email address, and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
              <p className="text-[var(--text-2)] mb-4">
                We also automatically collect certain information when you visit our website, including:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li>IP address and browser type</li>
                <li>Pages visited and time spent on site</li>
                <li>Device information and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p className="text-[var(--text-2)] mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account and orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">3. Information Sharing</h2>
              <p className="text-[var(--text-2)] mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li><strong>Service Providers:</strong> We share information with trusted third-party service providers who assist us in operating our website, processing payments, and delivering orders</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred as part of the business assets</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">4. Data Security</h2>
              <p className="text-[var(--text-2)] mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through trusted partners</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">5. Cookies and Tracking</h2>
              <p className="text-[var(--text-2)] mb-4">
                We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, 
                and personalize content. You can control cookie settings through your browser preferences.
              </p>
              <p className="text-[var(--text-2)] mb-4">
                Types of cookies we use:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">6. Your Rights (GDPR)</h2>
              <p className="text-[var(--text-2)] mb-4">
                Under the General Data Protection Regulation (GDPR), you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications</li>
              </ul>
              <p className="text-[var(--text-2)] mb-4">
                To exercise these rights, please contact us at privacy@goalmania.com
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">7. Data Retention</h2>
              <p className="text-[var(--text-2)] mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
                unless a longer retention period is required or permitted by law. Specifically:
              </p>
              <ul className="list-disc pl-6 text-[var(--text-2)] mb-4">
                <li>Account information: Until you request deletion or close your account</li>
                <li>Order information: 7 years for tax and accounting purposes</li>
                <li>Marketing communications: Until you unsubscribe or withdraw consent</li>
                <li>Website analytics: 26 months for Google Analytics data</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">8. International Transfers</h2>
              <p className="text-[var(--text-2)] mb-4">
                Your personal information may be transferred to and processed in countries other than your own. 
                We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">9. Children's Privacy</h2>
              <p className="text-[var(--text-2)] mb-4">
                Our website is not intended for children under 16 years of age. We do not knowingly collect personal information 
                from children under 16. If you believe we have collected such information, please contact us immediately.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">10. Changes to This Policy</h2>
              <p className="text-[var(--text-2)] mb-4">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting 
                the new policy on this page and updating the "Last Updated" date.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-white mb-3">11. Contact Information</h2>
              <p className="text-[var(--text-2)] mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
                             <div className="bg-[#0a0a0a] p-4 rounded-lg">
                 <p className="text-[var(--text-2)]">
                   <strong>Data Protection Officer:</strong><br />
                   <strong>Email:</strong> privacy@goalmania.com<br />
                   <strong>Location:</strong> Italy<br />
                   <strong>Contact:</strong> Please use the contact form above
                 </p>
               </div>
              <p className="text-[var(--text-2)] mt-4">
                You also have the right to lodge a complaint with the Italian Data Protection Authority (Garante per la protezione dei dati personali) 
                if you believe your rights have been violated.
              </p>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-white/8">
              <p className="text-sm text-white/50">
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