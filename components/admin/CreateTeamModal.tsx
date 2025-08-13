"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Team } from "@/hooks/useTeams";
import { TeamImageUpload } from "./TeamImageUpload";
import { ColorPicker } from "./ColorPicker";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/constants/countries";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function CreateTeamModal({ isOpen, onClose, onConfirm }: CreateTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    logo: "",
    colors: "",
    bgGradient: "",
    borderColor: "",
    textColor: "",
    isInternational: false,
    league: "",
    country: DEFAULT_COUNTRY,
    slug: "",
    isActive: true,
    displayOrder: 0,
  });

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // When toggling international status, reset country
      if (field === "isInternational") {
        newData.country = value ? "" : DEFAULT_COUNTRY;
      }

      return newData;
    });

    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error("Team name is required");
      }
      if (!formData.nickname.trim()) {
        throw new Error("Team nickname is required");
      }
      if (!formData.logo.trim()) {
        throw new Error("Team logo URL is required");
      }

      if (!formData.colors.trim()) {
        throw new Error("Colors gradient is required");
      }
      if (!formData.bgGradient.trim()) {
        throw new Error("Background gradient is required");
      }
      if (!formData.borderColor.trim()) {
        throw new Error("Border color is required");
      }
      if (!formData.textColor.trim()) {
        throw new Error("Text color is required");
      }

      await onConfirm(formData);
      
      // Reset form
      setFormData({
        name: "",
        nickname: "",
        logo: "",
        colors: "",
        bgGradient: "",
        borderColor: "",
        textColor: "",
        isInternational: false,
        league: "",
        country: DEFAULT_COUNTRY,
        slug: "",
        isActive: true,
        displayOrder: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] h-[90vh] !max-w-none !max-h-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Inter"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname *</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                placeholder="e.g., Nerazzurri"
                required
              />
            </div>
          </div>

          <TeamImageUpload
            value={formData.logo}
            onChange={(url) => handleInputChange("logo", url)}
            label="Team Logo *"
          />

          {/* Styling Properties */}
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              value={formData.colors}
              onChange={(value) => handleInputChange("colors", value)}
              label="Colors Gradient *"
              placeholder="from-blue-900 via-blue-800 to-black"
            />
            <ColorPicker
              value={formData.bgGradient}
              onChange={(value) => handleInputChange("bgGradient", value)}
              label="Background Gradient *"
              placeholder="from-blue-900/20 to-black/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              value={formData.borderColor}
              onChange={(value) => handleInputChange("borderColor", value)}
              label="Border Color *"
              placeholder="border-blue-500"
            />
            <ColorPicker
              value={formData.textColor}
              onChange={(value) => handleInputChange("textColor", value)}
              label="Text Color *"
              placeholder="text-blue-400"
            />
          </div>

          {/* Optional Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="league">League</Label>
              <Input
                id="league"
                value={formData.league}
                onChange={(e) => handleInputChange("league", e.target.value)}
                placeholder="Serie A, Premier League, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              {formData.isInternational ? (
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value} className="w-full">
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="country"
                  value="🇮🇹 Italy"
                  disabled
                  className="bg-muted w-full"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              placeholder="auto-generated from name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isInternational"
                checked={formData.isInternational}
                onCheckedChange={(checked) => handleInputChange("isInternational", checked === true)}
              />
              <Label htmlFor="isInternational">International Team</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked === true)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 