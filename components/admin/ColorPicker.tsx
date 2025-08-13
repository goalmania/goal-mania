"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  placeholder?: string;
}

export function ColorPicker({ value, onChange, label, placeholder }: ColorPickerProps) {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [fromColor, setFromColor] = useState("#3b82f6");
  const [toColor, setToColor] = useState("#1e40af");

  const isGradient = label?.toLowerCase().includes("gradient");

  // Generate Tailwind class from hex color
  const getTailwindFromHex = (hex: string) => {
    const colorMap: Record<string, string> = {
      "#ef4444": "red-500", "#dc2626": "red-600", "#b91c1c": "red-700", "#991b1b": "red-800", "#7f1d1d": "red-900",
      "#3b82f6": "blue-500", "#2563eb": "blue-600", "#1d4ed8": "blue-700", "#1e40af": "blue-800", "#1e3a8a": "blue-900",
      "#22c55e": "green-500", "#16a34a": "green-600", "#15803d": "green-700", "#166534": "green-800", "#14532d": "green-900",
      "#eab308": "yellow-500", "#ca8a04": "yellow-600", "#a16207": "yellow-700", "#854d0e": "yellow-800", "#713f12": "yellow-900",
      "#a855f7": "purple-500", "#9333ea": "purple-600", "#7c3aed": "purple-700", "#6d28d9": "purple-800", "#581c87": "purple-900",
      "#f97316": "orange-500", "#ea580c": "orange-600", "#c2410c": "orange-700", "#9a3412": "orange-800", "#7c2d12": "orange-900",
      "#6b7280": "gray-500", "#4b5563": "gray-600", "#374151": "gray-700", "#1f2937": "gray-800", "#111827": "gray-900",
      "#ec4899": "pink-500", "#db2777": "pink-600", "#be185d": "pink-700", "#9d174d": "pink-800", "#831843": "pink-900",
      "#06b6d4": "cyan-500", "#0891b2": "cyan-600", "#0e7490": "cyan-700", "#155e75": "cyan-800", "#164e63": "cyan-900",
      "#84cc16": "lime-500", "#65a30d": "lime-600", "#4d7c0f": "lime-700", "#365314": "lime-800", "#1a2e05": "lime-900",
      "#f59e0b": "amber-500", "#d97706": "amber-600", "#b45309": "amber-700", "#92400e": "amber-800", "#78350f": "amber-900",
      "#8b5cf6": "violet-500", "#8a2be2": "violet-600", "#7b68ee": "violet-700", "#5b21b6": "violet-800", "#4c1d95": "violet-900",
      "#64748b": "slate-500", "#475569": "slate-600", "#334155": "slate-700", "#1e293b": "slate-800", "#0f172a": "slate-900",
      "#000000": "black", "#ffffff": "white",
    };
    return colorMap[hex.toLowerCase()] || "blue-500";
  };

  const handleGradientChange = (fromHex: string, toHex: string) => {
    const fromTailwind = getTailwindFromHex(fromHex);
    const toTailwind = getTailwindFromHex(toHex);
    
    if (label?.toLowerCase().includes("background")) {
      onChange(`from-${fromTailwind}/20 to-${toTailwind}/20`);
    } else {
      onChange(`from-${fromTailwind} to-${toTailwind}`);
    }
  };

  const handleSolidColorChange = (newColor: string) => {
    const tailwindColor = getTailwindFromHex(newColor);
    
    if (label?.toLowerCase().includes("border")) {
      onChange(`border-${tailwindColor}`);
    } else if (label?.toLowerCase().includes("text")) {
      onChange(`text-${tailwindColor}`);
    } else {
      onChange(newColor);
    }
  };

  const QuickColorGrid = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Quick Colors</Label>
      <div className="grid grid-cols-6 gap-1">
        {[
          "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7",
          "#ec4899", "#06b6d4", "#84cc16", "#f59e0b", "#8b5cf6", "#64748b"
        ].map((color) => (
          <button
            key={color}
            className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );

  if (isGradient) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Input
          disabled
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
        />
        
        <div className="grid grid-cols-2 gap-3">
          {/* From Color */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">From Color</Label>
            <div className="flex gap-2">
              <Input
          disabled
                value={fromColor}
                onChange={(e) => {
                  setFromColor(e.target.value);
                  handleGradientChange(e.target.value, toColor);
                }}
                placeholder="#3b82f6"
                className="flex-1 text-xs"
              />
              <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 w-8 h-8"
                    style={{ backgroundColor: fromColor }}
                  >
                    <Palette className="h-3 w-3" style={{ color: fromColor === "#000000" ? "#ffffff" : "#000000" }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">From Color</Label>
                      <div className="mt-2">
                        <HexColorPicker
                          color={fromColor}
                          onChange={(color) => {
                            setFromColor(color);
                            handleGradientChange(color, toColor);
                          }}
                        />
                      </div>
                    </div>
                    <QuickColorGrid 
                      onColorSelect={(color) => {
                        setFromColor(color);
                        handleGradientChange(color, toColor);
                      }} 
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* To Color */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To Color</Label>
            <div className="flex gap-2">
              <Input
                disabled
                value={toColor}
                onChange={(e) => {
                  setToColor(e.target.value);
                  handleGradientChange(fromColor, e.target.value);
                }}
                placeholder="#1e40af"
                className="flex-1 text-xs"
              />
              <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 w-8 h-8"
                    style={{ backgroundColor: toColor }}
                  >
                    <Palette className="h-3 w-3" style={{ color: toColor === "#000000" ? "#ffffff" : "#000000" }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">To Color</Label>
                      <div className="mt-2">
                        <HexColorPicker
                          color={toColor}
                          onChange={(color) => {
                            setToColor(color);
                            handleGradientChange(fromColor, color);
                          }}
                        />
                      </div>
                    </div>
                    <QuickColorGrid 
                      onColorSelect={(color) => {
                        setToColor(color);
                        handleGradientChange(fromColor, color);
                      }} 
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Gradient Preview */}
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          <div 
            className="w-full h-8 rounded border border-gray-200 mt-1"
            style={{ 
              background: `linear-gradient(to right, ${fromColor}, ${toColor})` 
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Tailwind gradient classes (e.g., "from-blue-500 to-blue-700")
        </p>
      </div>
    );
  }

  // Single color picker for solid colors
  const [isOpen, setIsOpen] = useState(false);
  const [colorValue, setColorValue] = useState("#3b82f6");

  // Extract hex color from Tailwind classes
  const getHexFromValue = (val: string) => {
    if (val.startsWith("#")) return val;
    if (val.includes("blue")) return "#3b82f6";
    if (val.includes("red")) return "#ef4444";
    if (val.includes("green")) return "#22c55e";
    if (val.includes("yellow")) return "#eab308";
    if (val.includes("purple")) return "#a855f7";
    if (val.includes("orange")) return "#f97316";
    if (val.includes("gray")) return "#6b7280";
    if (val.includes("black")) return "#000000";
    if (val.includes("white")) return "#ffffff";
    return "#3b82f6";
  };

  const currentColor = getHexFromValue(value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Input
          disabled
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              style={{ backgroundColor: currentColor }}
            >
              <Palette className="h-4 w-4" style={{ color: currentColor === "#000000" ? "#ffffff" : "#000000" }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Pick a color</Label>
                <div className="mt-2">
                  <HexColorPicker
                    color={currentColor}
                    onChange={(color) => {
                      setColorValue(color);
                      handleSolidColorChange(color);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-200"
                  style={{ backgroundColor: currentColor }}
                />
                <Input
                  disabled
                  value={currentColor}
                  onChange={(e) => {
                    setColorValue(e.target.value);
                    handleSolidColorChange(e.target.value);
                  }}
                  className="text-xs"
                  placeholder="#3b82f6"
                />
              </div>
              <QuickColorGrid 
                onColorSelect={(color) => {
                  setColorValue(color);
                  handleSolidColorChange(color);
                }} 
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {label?.toLowerCase().includes("border") && (
        <p className="text-xs text-muted-foreground">
          Tailwind border classes (e.g., "border-blue-500")
        </p>
      )}
      {label?.toLowerCase().includes("text") && (
        <p className="text-xs text-muted-foreground">
          Tailwind text classes (e.g., "text-blue-400")
        </p>
      )}
    </div>
  );
} 