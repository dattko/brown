"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs.* must be used inside <Tabs>");
  }
  return ctx;
};

type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (next: string) => void;
  className?: string;
  children?: React.ReactNode;
};

export const Tabs = ({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: TabsProps) => {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    role="tablist"
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md bg-muted/60 p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
);

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export const TabsTrigger = ({ value, className, ...props }: TabsTriggerProps) => {
  const { value: current, setValue } = useTabsContext();
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
        active
          ? "bg-background text-foreground shadow-sm"
          : "hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
};

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const TabsContent = ({ value, className, ...props }: TabsContentProps) => {
  const { value: current } = useTabsContext();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
};
