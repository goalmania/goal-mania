import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface StockQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
}

export function StockQuantityInput({
  value,
  onChange,
  label = "Stock Quantity",
  error,
  required = false,
  description,
  disabled = false,
}: StockQuantityInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = value + 1;
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    if (value > 0) {
      const newValue = value - 1;
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numericValue = parseInt(newValue) || 0;
    if (numericValue >= 0) {
      onChange(numericValue);
    }
  };

  const handleInputBlur = () => {
    const numericValue = parseInt(inputValue) || 0;
    const finalValue = Math.max(0, numericValue);
    onChange(finalValue);
    setInputValue(finalValue.toString());
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={disabled || value <= 0}
          className="h-10 w-10 p-0"
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        
        <div className="flex">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min="0"
            placeholder="0"
            disabled={disabled}
            className={`text-center ${error ? "border-red-500" : ""}`}
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={disabled}
          className="h-10 w-10 p-0"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stock Status Indicator */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-muted-foreground">Current stock:</span>
        <span className={`font-medium ${
          value === 0 
            ? "text-red-600" 
            : value < 10 
            ? "text-amber-600" 
            : "text-green-600"
        }`}>
          {value} units
        </span>
        {value === 0 && (
          <span className="text-red-600 font-medium">(Out of stock)</span>
        )}
        {value > 0 && value < 10 && (
          <span className="text-amber-600 font-medium">(Low stock)</span>
        )}
      </div>
    </div>
  );
} 