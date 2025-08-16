"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ApiTestPage() {
  const [paypalEnvStatus, setPaypalEnvStatus] = useState<any>(null);
  const [paypalScriptStatus, setPaypalScriptStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkPayPalEnv = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-paypal-env");
      const data = await response.json();
      setPaypalEnvStatus(data);
    } catch (error) {
      console.error("Error checking PayPal environment:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPayPalScript = () => {
    const status = {
      windowPaypal: typeof window !== 'undefined' && !!(window as any).paypal,
      paypalVersion: typeof window !== 'undefined' && (window as any).paypal ? (window as any).paypal.version : 'Not loaded',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server side',
      timestamp: new Date().toISOString()
    };
    setPaypalScriptStatus(status);
  };

  useEffect(() => {
    checkPayPalEnv();
    checkPayPalScript();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">API & PayPal Debug Page</h1>
      
      {/* PayPal Environment Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            PayPal Environment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkPayPalEnv} disabled={loading} className="mb-4">
            {loading ? "Checking..." : "Check PayPal Environment"}
          </Button>
          
          {paypalEnvStatus && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Environment Variables:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(paypalEnvStatus.environment, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">PayPal Authentication Test:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(paypalEnvStatus.paypalAuthTest, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PayPal Script Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            PayPal Script Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkPayPalScript} className="mb-4">
            Check PayPal Script
          </Button>
          
          {paypalScriptStatus && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Script Status:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(paypalScriptStatus, null, 2)}
                </pre>
              </div>
              
              {!paypalScriptStatus.windowPaypal && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    PayPal script is not loaded in the browser. This could be due to:
                    <ul className="list-disc list-inside mt-2 ml-4">
                      <li>Ad blockers or security software</li>
                      <li>Network connectivity issues</li>
                      <li>Script loading failures</li>
                      <li>CORS issues</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p><strong>If PayPal script is not loading:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Disable ad blockers or security software temporarily</li>
              <li>Check browser console for CORS errors</li>
              <li>Ensure you're using HTTPS in production</li>
              <li>Verify PayPal credentials are correct</li>
            </ul>
            
            <p className="mt-4"><strong>If authentication is failing:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check that PAYPAL_MODE matches your credentials</li>
              <li>Verify client ID and secret are from the same environment</li>
              <li>Ensure PayPal application is properly configured</li>
              <li>Check PayPal developer dashboard for any restrictions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
