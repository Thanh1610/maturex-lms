"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "@/lib/utils";

const TabsRoot = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-[23px] max-sm:gap-[22px] border-b border-[#e6e2ec] mb-[23px] overflow-auto [scrollbar-width:thin] w-full",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "tabs-btn text-[11px] max-sm:text-[10px] font-medium py-[15px] max-sm:py-3 whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors duration-150 border-b-2 border-transparent text-[#a198ab] hover:text-[#8464ae]",
      "data-[state=active]:border-[#a28abd] data-[state=active]:text-[#8464ae] data-[state=active]:active",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export interface TabItemObject {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: Array<string | TabItemObject>;
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <TabsRoot value={value} onValueChange={onChange} className={className}>
      <TabsList>
        {items.map((item) => {
          const key = typeof item === "string" ? item : item.id;
          const label = typeof item === "string" ? item : item.label;
          const count = typeof item !== "string" ? item.count : undefined;

          return (
            <TabsTrigger key={key} value={key}>
              <span>{label}</span>
              {count !== undefined && (
                <span className="bg-[#f0eaf7] text-[#9477b8] text-[10px] px-1.5 py-0.5 rounded-[5px]">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </TabsRoot>
  );
}

export { TabsContent, TabsList, TabsRoot, TabsTrigger };
