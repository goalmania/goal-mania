import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children?: React.ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, description, children }, ref) => {
    return (
      <div ref={ref} className="space-y-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {children}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && (
          <Alert variant="destructive" className="py-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

// Input Field Component
interface InputFieldProps extends FormFieldProps {
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  type?: "text" | "number" | "email" | "url";
  min?: number;
  max?: number;
  step?: number;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ name, value, onChange, placeholder, type = "text", min, max, step, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
      onChange(newValue);
    };

    return (
      <FormField {...props}>
        <Input
          ref={ref}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          type={type}
          min={min}
          max={max}
          step={step}
          className={props.error ? "border-red-500" : ""}
        />
      </FormField>
    );
  }
);

InputField.displayName = "InputField";

// Textarea Field Component
interface TextareaFieldProps extends FormFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ name, value, onChange, placeholder, rows = 4, ...props }, ref) => {
    return (
      <FormField {...props}>
        <Textarea
          ref={ref}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={props.error ? "border-red-500" : ""}
        />
      </FormField>
    );
  }
);

TextareaField.displayName = "TextareaField";

// Select Field Component
interface SelectFieldProps extends FormFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ name, value, onChange, options, placeholder, ...props }, ref) => {
    return (
      <FormField {...props}>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger ref={ref} className={props.error ? "border-red-500" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }
);

SelectField.displayName = "SelectField";

// Checkbox Field Component
interface CheckboxFieldProps extends FormFieldProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckboxField = forwardRef<HTMLButtonElement, CheckboxFieldProps>(
  ({ name, checked, onChange, ...props }, ref) => {
    return (
      <FormField {...props}>
        <div className="flex items-center space-x-2">
          <Checkbox
            ref={ref}
            id={name}
            checked={checked}
            onCheckedChange={onChange}
          />
          <Label htmlFor={name} className="text-sm font-normal">
            {props.label}
          </Label>
        </div>
      </FormField>
    );
  }
);

CheckboxField.displayName = "CheckboxField";

// Size Selection Component
interface SizeSelectionProps extends FormFieldProps {
  sizes: string[];
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  sizeType: "adult" | "kids";
}

export const SizeSelection = forwardRef<HTMLDivElement, SizeSelectionProps>(
  ({ sizes, selectedSizes, onSizeToggle, sizeType, ...props }, ref) => {
    return (
      <FormField {...props}>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => onSizeToggle(size)}
              className="h-8"
            >
              {sizeType === "kids" ? `Kids ${size}` : size}
            </Button>
          ))}
        </div>
        {selectedSizes.length === 0 && (
          <p className="text-xs text-amber-600">
            Please select at least one {sizeType} size
          </p>
        )}
      </FormField>
    );
  }
);

SizeSelection.displayName = "SizeSelection";

// Patch Selection Component
interface PatchSelectionProps extends FormFieldProps {
  patches: Array<{ id: string; name: string }>;
  selectedPatches: string[];
  onPatchToggle: (patch: string) => void;
}

export const PatchSelection = forwardRef<HTMLDivElement, PatchSelectionProps>(
  ({ patches, selectedPatches, onPatchToggle, ...props }, ref) => {
    return (
      <FormField {...props}>
        <div className="grid grid-cols-1 gap-2">
          {patches.map((patch) => (
            <div key={patch.id} className="flex items-center space-x-2">
              <Checkbox
                id={`patch-${patch.id}`}
                checked={selectedPatches.includes(patch.id)}
                onCheckedChange={() => onPatchToggle(patch.id)}
              />
              <Label htmlFor={`patch-${patch.id}`} className="text-sm">
                {patch.name}
              </Label>
            </div>
          ))}
        </div>
      </FormField>
    );
  }
);

PatchSelection.displayName = "PatchSelection";

// Image Upload Component
interface ImageUploadProps extends FormFieldProps {
  images: string[];
  onImageAdd: (url: string) => void;
  onImageRemove: (url: string) => void;
  onImageUpload: (files: FileList) => void;
  isUploading?: boolean;
}

export const ImageUpload = forwardRef<HTMLDivElement, ImageUploadProps>(
  ({ images, onImageAdd, onImageRemove, onImageUpload, isUploading, ...props }, ref) => {
    const [imageUrl, setImageUrl] = useState("");

    const handleImageUrlAdd = () => {
      if (imageUrl.trim()) {
        onImageAdd(imageUrl.trim());
        setImageUrl("");
      }
    };

    return (
      <FormField {...props}>
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Images</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && onImageUpload(e.target.files)}
                disabled={isUploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f5963c] file:text-white hover:file:bg-[#e0852e]"
              />
              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f5963c]"></div>
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Manual URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Add Image URL</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleImageUrlAdd}
                disabled={!imageUrl.trim()}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="space-y-4">
              <Label>Image Preview ({images.length} images)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 group"
                  >
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      onClick={() => onImageRemove(url)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

ImageUpload.displayName = "ImageUpload"; 