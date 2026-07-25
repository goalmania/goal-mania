"use client";

import { useEffect, useState } from "react";
import { BellIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "checking" | "unsupported" | "not-standalone" | "denied" | "subscribed" | "ready";

export default function PushNotificationButton() {
  const [status, setStatus] = useState<Status>("checking");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setStatus("subscribed");
        return;
      }
    } catch {
      // ignore, fall through
    }

    if (!isStandalone) {
      setStatus("not-standalone");
      return;
    }

    setStatus("ready");
  };

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        toast.error("Permesso notifiche negato");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Configurazione notifiche mancante");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });

      if (!res.ok) throw new Error();
      setStatus("subscribed");
      toast.success("Notifiche ordini attivate!");
    } catch (err) {
      console.error("Push subscribe error:", err);
      toast.error("Errore nell'attivazione delle notifiche");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "checking" || status === "unsupported" || status === "subscribed") {
    if (status !== "subscribed") return null;
    return (
      <div className="flex items-center gap-2 text-sm text-[#c8f000]">
        <BellAlertIcon className="h-4 w-4" />
        <span>Notifiche ordini attive</span>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-white/40">
        <BellIcon className="h-4 w-4" />
        <span>Notifiche bloccate — abilitale nelle impostazioni di Safari</span>
      </div>
    );
  }

  if (status === "not-standalone") {
    return (
      <div className="flex items-center gap-2 text-sm text-white/40">
        <BellIcon className="h-4 w-4" />
        <span>Apri il sito dall'icona sulla schermata Home per attivare le notifiche</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={isLoading}
      className="flex items-center gap-2 bg-[#c8f000] hover:bg-[#d4f520] text-black font-semibold text-sm px-4 py-2 rounded-xl active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
    >
      <BellIcon className="h-4 w-4" />
      {isLoading ? "Attivazione..." : "Attiva notifiche ordini"}
    </button>
  );
}
