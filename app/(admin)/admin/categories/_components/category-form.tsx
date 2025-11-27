"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useI18n } from "@/lib/hooks/useI18n";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  type: z.enum(["league", "product-type", "special"]),
  description: z.string().optional(),
  customHref: z.string().optional(),
  isActive: z.boolean(),
  order: z.number(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  type: "league" | "product-type" | "special";
  slug?: string;
  description?: string;
  customHref?: string;
  order: number;
  isActive: boolean;
}

interface CategoryFormProps {
  initialData?: Category;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  // Static league options that can be selected as category names
  const staticLeagueOptions = [
    { name: t("nav.laliga"), value: "La Liga", href: "/international/laliga" },
    { name: t("nav.premierLeague"), value: "Premier League", href: "/international/premierLeague" },
    { name: t("nav.bundesliga"), value: "Bundesliga", href: "/international/bundesliga" },
    { name: t("nav.ligue1"), value: "Ligue 1", href: "/international/ligue1" },
    { name: t("nav.serieA"), value: "Serie A", href: "/international/serieA" },
    { name: t("nav.leaguesOverview"), value: "Leagues Overview", href: "/leagues-overview" },
  ];

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      type: "league",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/admin/categories/${initialData.id}`
        : "/api/admin/categories";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      toast.success(`Category ${initialData ? "updated" : "created"} successfully`);
      router.refresh();
      router.push("/admin/categories");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit" : "Create"} Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Category name" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug from name if slug is empty
                        if (!form.getValues("slug") || form.getValues("slug") === "") {
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                          form.setValue("slug", slug);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Or select from static league options below
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Static League Options Dropdown */}
            <FormItem>
              <FormLabel>Select from Static Leagues (Optional)</FormLabel>
              <Select
                onValueChange={(value) => {
                  const selectedOption = staticLeagueOptions.find(opt => opt.value === value);
                  if (selectedOption) {
                    form.setValue("name", selectedOption.value);
                    // Auto-generate slug
                    const slug = selectedOption.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    form.setValue("slug", slug);
                    // Set custom href if available
                    if (selectedOption.href) {
                      form.setValue("customHref", selectedOption.href);
                    }
                    // Reset the select after selection
                    setTimeout(() => {
                      const selectElement = document.querySelector('[data-state="open"]') as HTMLElement;
                      if (selectElement) {
                        selectElement.click();
                      }
                    }, 100);
                  }
                }}
                defaultValue=""
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a static league option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staticLeagueOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecting an option will auto-fill the name, slug, and custom link fields
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="category-slug" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier (auto-generated from name if left empty)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="product-type">Product Type</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only "League" type categories with Active status will appear in the header navigation dropdown.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Category description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Display order"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers will be displayed first
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customHref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="/international/laliga" {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom URL for this category (e.g., /international/laliga, /leagues-overview). 
                    If left empty, will use /category/[slug]
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Inactive categories will not be displayed on the site
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}