"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDiscountRuleData } from "@/hooks/useDiscountRuleData";
import { MultiSelectDropdown } from "@/components/admin/MultiSelectDropdown";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DiscountRuleFormSchema, type DiscountRuleFormData } from "@/lib/schemas/discountRule";

interface DiscountRule {
  _id: string;
  name: string;
  description: string;
  type: "quantity_based" | "buy_x_get_y" | "percentage_off" | "fixed_amount_off";
  isActive: boolean;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  priority: number;
  minQuantity?: number;
  maxQuantity?: number;
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getFreeQuantity?: number;
  freeProductIds?: string[];
  applicableCategories?: string[];
  applicableProductIds?: string[];
  excludedProductIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DiscountRulesPage() {
  const { t } = useTranslation();
  const { products, categories, loading: dataLoading } = useDiscountRuleData();
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);

  // Create form
  const createForm = useForm<DiscountRuleFormData>({
    resolver: zodResolver(DiscountRuleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "quantity_based",
      isActive: true,
      priority: 1,
      minQuantity: null,
      maxQuantity: null,
      discountPercentage: null,
      discountAmount: null,
      buyQuantity: null,
      getFreeQuantity: null,
      freeProductIds: [],
      applicableCategories: [],
      applicableProductIds: [],
      excludedProductIds: [],
    },
  });

  // Edit form
  const editForm = useForm<DiscountRuleFormData>({
    resolver: zodResolver(DiscountRuleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "quantity_based",
      isActive: true,
      priority: 1,
      minQuantity: null,
      maxQuantity: null,
      discountPercentage: null,
      discountAmount: null,
      buyQuantity: null,
      getFreeQuantity: null,
      freeProductIds: [],
      applicableCategories: [],
      applicableProductIds: [],
      excludedProductIds: [],
    },
  });

  useEffect(() => {
    fetchDiscountRules();
  }, []);

  const fetchDiscountRules = async () => {
    try {
      const response = await fetch("/api/admin/discount-rules");
      if (response.ok) {
        const data = await response.json();
        setDiscountRules(data);
      } else {
        toast.error("Failed to fetch discount rules");
      }
    } catch (error) {
      toast.error("Failed to fetch discount rules");
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (data: DiscountRuleFormData) => {
    try {
      const response = await fetch("/api/admin/discount-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(t("admin.discountRules.createSuccess"));
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchDiscountRules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create discount rule");
      }
    } catch (error) {
      toast.error("Failed to create discount rule");
    }
  };

  const onEditSubmit = async (data: DiscountRuleFormData) => {
    if (!editingRule) return;

    try {
      const response = await fetch(`/api/admin/discount-rules/${editingRule._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t("admin.discountRules.updateSuccess"));
        setIsEditDialogOpen(false);
        setEditingRule(null);
        editForm.reset();
        fetchDiscountRules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update discount rule");
      }
    } catch (error) {
      toast.error("Failed to update discount rule");
    }
  };

  const handleEdit = (rule: DiscountRule) => {
    setEditingRule(rule);
    editForm.reset({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      isActive: rule.isActive,
      priority: rule.priority,
      minQuantity: rule.minQuantity || null,
      maxQuantity: rule.maxQuantity || null,
      discountPercentage: rule.discountPercentage || null,
      discountAmount: rule.discountAmount || null,
      buyQuantity: rule.buyQuantity || null,
      getFreeQuantity: rule.getFreeQuantity || null,
      freeProductIds: rule.freeProductIds || [],
      applicableCategories: rule.applicableCategories || [],
      applicableProductIds: rule.applicableProductIds || [],
      excludedProductIds: rule.excludedProductIds || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/admin/discount-rules/${ruleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("admin.discountRules.deleteSuccess"));
        fetchDiscountRules();
      } else {
        toast.error(t("admin.discountRules.deleteFailed"));
      }
    } catch (error) {
      toast.error(t("admin.discountRules.deleteFailed"));
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.discountRules.title")}</h1>
          <p className="text-muted-foreground">{t("admin.discountRules.management")}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t("admin.discountRules.create")}
        </Button>
      </div>

      {discountRules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("admin.discountRules.noRules")}</h3>
              <p className="text-muted-foreground">{t("admin.discountRules.createFirstRule")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Discount Rules</CardTitle>
            <CardDescription>
              Manage your discount rules and their application logic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountRules.map((rule) => (
                  <TableRow key={rule._id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {rule.type === "quantity_based" && t("admin.discountRules.quantityBased")}
                        {rule.type === "buy_x_get_y" && t("admin.discountRules.buyXGetY")}
                        {rule.type === "percentage_off" && t("admin.discountRules.percentageOff")}
                        {rule.type === "fixed_amount_off" && t("admin.discountRules.fixedAmountOff")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      {rule.currentUses}
                      {rule.maxUses && ` / ${rule.maxUses}`}
                    </TableCell>
                    <TableCell>
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("admin.discountRules.delete")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("admin.discountRules.confirmDelete")} {t("admin.discountRules.actionCannotBeUndone")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(rule._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin.discountRules.create")}</DialogTitle>
            <DialogDescription>
              Create a new discount rule to apply automatic discounts to your products.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter rule name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.type")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quantity_based">{t("admin.discountRules.quantityBased")}</SelectItem>
                          <SelectItem value="buy_x_get_y">{t("admin.discountRules.buyXGetY")}</SelectItem>
                          <SelectItem value="percentage_off">{t("admin.discountRules.percentageOff")}</SelectItem>
                          <SelectItem value="fixed_amount_off">{t("admin.discountRules.fixedAmountOff")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.discountRules.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter rule description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.priority")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Unlimited if empty"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type-specific fields */}
              {createForm.watch("type") === "quantity_based" && (
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={createForm.control}
                    name="minQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.minQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Min quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="maxQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.maxQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Max quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.discountPercentage")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0-100%"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {createForm.watch("type") === "buy_x_get_y" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.buyQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Buy quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="getFreeQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.getFreeQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Free quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {(createForm.watch("type") === "percentage_off" || createForm.watch("type") === "fixed_amount_off") && (
                <FormField
                  control={createForm.control}
                  name={createForm.watch("type") === "percentage_off" ? "discountPercentage" : "discountAmount"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {createForm.watch("type") === "percentage_off" ? t("admin.discountRules.discountPercentage") : t("admin.discountRules.discountAmount")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max={createForm.watch("type") === "percentage_off" ? "100" : undefined}
                          step={createForm.watch("type") === "percentage_off" ? "0.1" : "0.01"}
                          placeholder={createForm.watch("type") === "percentage_off" ? "0-100%" : "0.00"}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="applicableCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.applicableCategories")}</FormLabel>
                      <FormControl>
                        <MultiSelectDropdown
                          options={categories}
                          selectedValues={field.value}
                          onSelectionChange={field.onChange}
                          placeholder="Select categories"
                          searchPlaceholder="Search categories..."
                          emptyMessage="No categories found"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="applicableProductIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.applicableProductIds")}</FormLabel>
                      <FormControl>
                        <MultiSelectDropdown
                          options={products.map(p => ({ value: p._id, label: p.title }))}
                          selectedValues={field.value}
                          onSelectionChange={field.onChange}
                          placeholder="Select products"
                          searchPlaceholder="Search products..."
                          emptyMessage="No products found"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="excludedProductIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.discountRules.excludedProductIds")}</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        options={products.map(p => ({ value: p._id, label: p.title }))}
                        selectedValues={field.value}
                        onSelectionChange={field.onChange}
                        placeholder="Select products to exclude"
                        searchPlaceholder="Search products..."
                        emptyMessage="No products found"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("admin.discountRules.isActive")}</FormLabel>
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  createForm.reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createForm.formState.isSubmitting}>
                  {createForm.formState.isSubmitting ? "Creating..." : "Create Rule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("admin.discountRules.edit")}</DialogTitle>
            <DialogDescription>
              Edit the discount rule settings and configuration.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter rule name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.type")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quantity_based">{t("admin.discountRules.quantityBased")}</SelectItem>
                          <SelectItem value="buy_x_get_y">{t("admin.discountRules.buyXGetY")}</SelectItem>
                          <SelectItem value="percentage_off">{t("admin.discountRules.percentageOff")}</SelectItem>
                          <SelectItem value="fixed_amount_off">{t("admin.discountRules.fixedAmountOff")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.discountRules.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter rule description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.priority")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Unlimited if empty"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type-specific fields for edit form */}
              {editForm.watch("type") === "quantity_based" && (
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="minQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.minQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Min quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="maxQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.maxQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Max quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.discountPercentage")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0-100%"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {editForm.watch("type") === "buy_x_get_y" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="buyQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.buyQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Buy quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="getFreeQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.discountRules.getFreeQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Free quantity"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {(editForm.watch("type") === "percentage_off" || editForm.watch("type") === "fixed_amount_off") && (
                <FormField
                  control={editForm.control}
                  name={editForm.watch("type") === "percentage_off" ? "discountPercentage" : "discountAmount"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {editForm.watch("type") === "percentage_off" ? t("admin.discountRules.discountPercentage") : t("admin.discountRules.discountAmount")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max={editForm.watch("type") === "percentage_off" ? "100" : undefined}
                          step={editForm.watch("type") === "percentage_off" ? "0.1" : "0.01"}
                          placeholder={editForm.watch("type") === "percentage_off" ? "0-100%" : "0.00"}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="applicableCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.applicableCategories")}</FormLabel>
                      <FormControl>
                        <MultiSelectDropdown
                          options={categories}
                          selectedValues={field.value}
                          onSelectionChange={field.onChange}
                          placeholder="Select categories"
                          searchPlaceholder="Search categories..."
                          emptyMessage="No categories found"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="applicableProductIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.discountRules.applicableProductIds")}</FormLabel>
                      <FormControl>
                        <MultiSelectDropdown
                          options={products.map(p => ({ value: p._id, label: p.title }))}
                          selectedValues={field.value}
                          onSelectionChange={field.onChange}
                          placeholder="Select products"
                          searchPlaceholder="Search products..."
                          emptyMessage="No products found"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="excludedProductIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.discountRules.excludedProductIds")}</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        options={products.map(p => ({ value: p._id, label: p.title }))}
                        selectedValues={field.value}
                        onSelectionChange={field.onChange}
                        placeholder="Select products to exclude"
                        searchPlaceholder="Search products..."
                        emptyMessage="No products found"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("admin.discountRules.isActive")}</FormLabel>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? "Updating..." : "Update Rule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
