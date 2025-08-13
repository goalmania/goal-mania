import { Metadata } from "next";
import { Truck, Clock, Shield, MapPin, Package, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Information | Goal Mania",
  description: "Shipping options, delivery times, and policies for Goal Mania football jerseys.",
};

export default function ShippingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="container mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold mb-6 text-black">Shipping Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fast, reliable shipping for all your football jersey needs. Free shipping on all orders within Italy!
          </p>
        </div>

        {/* Free Delivery Banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-[#f5963c] to-[#e0852e] rounded-2xl p-8 text-white text-center">
            <Truck className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Free Delivery in Italy</h2>
            <p className="text-xl opacity-90">
              All orders are delivered free within Italy. No minimum purchase required!
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Delivery Options */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Domestic Delivery */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <MapPin className="h-8 w-8 text-[#f5963c] mr-3" />
                <h2 className="text-2xl font-bold text-[#0e1924]">Domestic Delivery (Italy)</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-[#0e1924]">Standard Delivery</h3>
                    <p className="text-sm text-gray-600">3-5 business days</p>
                  </div>
                  <span className="text-2xl font-bold text-[#f5963c]">FREE</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-[#0e1924]">Express Delivery</h3>
                    <p className="text-sm text-gray-600">1-2 business days</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">€9.99</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <h3 className="font-semibold text-[#0e1924]">Same Day Delivery</h3>
                    <p className="text-sm text-gray-600">Order by 12:00 PM (Roma area)</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">€19.99</span>
                </div>
              </div>
            </div>

            {/* International Delivery */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-[#f5963c] mr-3" />
                <h2 className="text-2xl font-bold text-[#0e1924]">International Delivery</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-[#0e1924]">European Union</h3>
                    <p className="text-sm text-gray-600">5-7 business days</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">€12.99</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-semibold text-[#0e1924]">Rest of Europe</h3>
                    <p className="text-sm text-gray-600">7-10 business days</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">€15.99</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <h3 className="font-semibold text-[#0e1924]">Worldwide</h3>
                    <p className="text-sm text-gray-600">10-15 business days</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">€24.99</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Process */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-[#0e1924] mb-8 text-center">How Delivery Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-[#f5963c] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Order Placed</h3>
                <p className="text-gray-600 text-sm">Your order is confirmed and payment is processed securely</p>
              </div>
              <div className="text-center">
                <div className="bg-[#f5963c] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Order Processed</h3>
                <p className="text-gray-600 text-sm">We pick, pack, and prepare your jersey for shipment</p>
              </div>
              <div className="text-center">
                <div className="bg-[#f5963c] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Dispatched</h3>
                <p className="text-gray-600 text-sm">Your order is dispatched with tracking information sent to your email</p>
              </div>
              <div className="text-center">
                <div className="bg-[#f5963c] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Delivered</h3>
                <p className="text-gray-600 text-sm">Your jersey arrives safely at your doorstep</p>
              </div>
            </div>
          </div>

          {/* Delivery Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Package className="h-12 w-12 text-[#f5963c] mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Secure Packaging</h3>
              <p className="text-gray-600 text-sm">All jerseys are carefully packaged to ensure they arrive in perfect condition</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Shield className="h-12 w-12 text-[#f5963c] mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Insurance Included</h3>
              <p className="text-gray-600 text-sm">All deliveries include insurance for your peace of mind</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Clock className="h-12 w-12 text-[#f5963c] mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">Track your order from warehouse to doorstep with detailed updates</p>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-[#0e1924] mb-6">Important Delivery Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-[#0e1924] mb-4">Processing Times</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Orders placed before 2:00 PM CET are dispatched same day</li>
                  <li>• Orders placed after 2:00 PM CET are dispatched next business day</li>
                  <li>• Weekend orders are dispatched Monday</li>
                  <li>• Holiday orders may have extended processing times</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0e1924] mb-4">Delivery Notes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Signature may be required for high-value orders</li>
                  <li>• Delivery attempts are made during business hours</li>
                  <li>• Failed deliveries are held at local post office</li>
                  <li>• International orders may incur customs fees</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-[#0e1924] mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">When will I receive my tracking number?</h3>
                <p className="text-gray-700">You'll receive a tracking number via email within 24 hours of your order being dispatched.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">What if my package is lost or damaged?</h3>
                <p className="text-gray-700">All deliveries are insured. Contact us immediately if your package is lost or damaged, and we'll help resolve the issue.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Do you deliver to PO boxes?</h3>
                <p className="text-gray-700">Yes, we deliver to PO boxes. However, some express delivery options may not be available for PO box addresses.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">Can I change my delivery address after ordering?</h3>
                <p className="text-gray-700">You can change your delivery address within 2 hours of placing your order by contacting our customer service team.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#0e1924] mb-2">What are the customs fees for international orders?</h3>
                <p className="text-gray-700">Customs fees vary by country and are the responsibility of the recipient. We recommend checking with your local customs office for specific rates.</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-[#0e1924] mb-4">Need Help with Delivery?</h2>
            <p className="text-gray-600 mb-6">
              Our customer service team is here to help with any delivery questions or concerns.
            </p>
            <a
              href="/contact"
              className="inline-block bg-[#f5963c] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#e0852e] transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 