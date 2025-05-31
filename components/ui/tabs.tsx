"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  value: string;
  onClick?: () => void;
}

interface TabsContentProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  value: string;
}

const Tabs = ({
  defaultValue,
  ...props
}: TabsProps & React.HTMLAttributes<HTMLDivElement>) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div {...props} data-active-tab={activeTab}>
      {React.Children.map(props.children, (child) => {
        if (!React.isValidElement(child)) return child;

        if (child.type === TabsList) {
          return React.cloneElement(
            child as React.ReactElement<TabsListProps>,
            {
              activeTab,
              setActiveTab,
            }
          );
        }

        if (child.type === TabsContent) {
          return React.cloneElement(
            child as React.ReactElement<TabsContentProps>,
            {
              active: (child.props as TabsContentProps).value === activeTab,
            }
          );
        }

        return child;
      })}
    </div>
  );
};

const TabsList = ({
  children,
  className,
  activeTab,
  setActiveTab,
  ...props
}: TabsListProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex h-10 items-center justify-start rounded-md bg-gray-100 p-1 overflow-x-auto scrollbar-hide",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || child.type !== TabsTrigger)
          return child;

        return React.cloneElement(
          child as React.ReactElement<TabsTriggerProps>,
          {
            active: (child.props as TabsTriggerProps).value === activeTab,
            onClick: () => {
              setActiveTab?.((child.props as TabsTriggerProps).value);
              (child.props as TabsTriggerProps).onClick?.();
            },
          }
        );
      })}
    </div>
  );
};

const TabsTrigger = ({
  children,
  className,
  active,
  value,
  ...props
}: TabsTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0",
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-500 hover:text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({
  children,
  className,
  active,
  value,
  ...props
}: TabsContentProps & React.HTMLAttributes<HTMLDivElement>) => {
  if (!active) return null;

  return (
    <div
      className={cn(
        "mt-2 overflow-x-hidden ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
