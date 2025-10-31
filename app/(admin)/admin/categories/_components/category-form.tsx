"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  parentId: z.string().optional(),
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
  order: number;
  isActive: boolean;
  parentId?: string;
}

interface CategoryFormProps {
  initialData?: Category;
  categories?: Category[];
}

export function CategoryForm({ initialData, categories }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
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

            {categories && categories.length > 0 && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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