"use client";

import { ReactNode, useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

interface ToastProps {
  title: string;
  description: string;
  duration?: number;
  image?: string;
  cta?: {
    label: string;
    href: string;
  };
  onClose?: () => void;
  className?: string;
}

export function Toast({
  title,
  description,
  duration = 0,
  image,
  cta,
  onClose,
  className = "",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 transition-all duration-300 ${className}`}
    >
      <div className="relative p-4">
        {/* Accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent-bg"></div>

        <div className="flex">
          {image && (
            <div className="flex-shrink-0 mr-4">
              <Image
                src={image}
                alt="Promotional item"
                width={80}
                height={80}
                className="rounded-md object-cover border border-gray-200 shadow-sm"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-black bg-amber-100 px-1 rounded">
                {title}
              </h3>
              <button
                onClick={handleClose}
                className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-800 font-medium">
              {description}
            </p>
            {cta && (
              <div className="mt-3">
                <Link
                  href={cta.href}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-800 transition-colors duration-150"
                >
                  {cta.label}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Animated pulsing dot to attract attention */}
        <div className="absolute -top-1 -right-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-bg opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-bg"></span>
          </span>
        </div>
      </div>
    </div>
  );
}
