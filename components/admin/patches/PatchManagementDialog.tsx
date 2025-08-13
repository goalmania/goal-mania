"use client";

import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatchForm } from "./patch-form";
import { usePatches } from "@/hooks/usePatches";
import { IPatch, PATCH_CATEGORIES, PatchCategory } from "@/lib/types/patch";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PatchManagementDialogProps {
  children: React.ReactNode;
}

type DialogMode = "list" | "create" | "edit";

export function PatchManagementDialog({ children }: PatchManagementDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("list");
  const [editingPatch, setEditingPatch] = useState<IPatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PatchCategory | "all">("all");
  const [showInactivePatches, setShowInactivePatches] = useState(false);

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    isActive: showInactivePatches ? undefined : true,
  }), [searchQuery, selectedCategory, showInactivePatches]);

  const { patches, loading, error, deletePatch, refetch } = usePatches(filters);

  const handleDelete = async (patchId: string, patchTitle: string) => {
    if (!confirm(`${t('admin.patches.confirmDelete')} "${patchTitle}"? ${t('admin.patches.actionCannotBeUndone')}`)) {
      return;
    }

    const success = await deletePatch(patchId);
    if (success) {
      toast.success(t('admin.patches.deleteSuccess'));
    } else {
      toast.error(t('admin.patches.deleteFailed'));
    }
  };

  const handleEdit = (patch: IPatch) => {
    setEditingPatch(patch);
    setMode("edit");
  };

  const handleCreate = () => {
    setEditingPatch(null);
    setMode("create");
  };

  const handleFormSuccess = () => {
    setMode("list");
    setEditingPatch(null);
    refetch();
    toast.success(mode === "create" ? t('admin.patches.createSuccess') : t('admin.patches.updateSuccess'));
  };

  const handleFormCancel = () => {
    setMode("list");
    setEditingPatch(null);
  };

  const resetAndClose = () => {
    setMode("list");
    setEditingPatch(null);
    setSearchQuery("");
    setSelectedCategory("all");
    setShowInactivePatches(false);
    setOpen(false);
  };

  const getCategoryColor = (category: PatchCategory) => {
    const colors = {
      "serie-a": "bg-blue-100 text-blue-800 border-blue-200",
      "champions-league": "bg-purple-100 text-purple-800 border-purple-200",
      "coppa-italia": "bg-green-100 text-green-800 border-green-200",
      "europa-league": "bg-orange-100 text-orange-800 border-orange-200",
      "other": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category] || colors.other;
  };

  const renderListView = () => (
    <>
      {/* Header with filters and create button */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TagIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{t('admin.patches.management')}</h3>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#f5963c] hover:bg-[#e0852e]"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('admin.patches.create')}
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={(value: PatchCategory | "all") => setSelectedCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PATCH_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showInactivePatches ? "secondary" : "outline"}
            onClick={() => setShowInactivePatches(!showInactivePatches)}
            size="sm"
          >
            {showInactivePatches ? <EyeSlashIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
            {showInactivePatches ? "Hide Inactive" : "Show Inactive"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Patches List */}
        <div className="space-y-4 pr-4 h-[400px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5963c]"></div>
            <span className="ml-2 text-muted-foreground">Loading patches...</span>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && patches.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No patches found</p>
            <p className="text-sm">
              {searchQuery || selectedCategory !== "all" ? "Try adjusting your filters" : "Create your first patch to get started"}
            </p>
          </div>
        )}

        {!loading && patches.map((patch) => (
          <div key={patch._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                             {/* Image thumbnail */}
               <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                 {patch.imageUrl ? (
                   <img 
                     src={patch.imageUrl} 
                     alt={patch.title}
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                     }}
                   />
                 ) : (
                   <PhotoIcon className="h-6 w-6 text-gray-400" />
                 )}
               </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-sm text-gray-900 truncate">{patch.title}</h3>
                  {!patch.isActive && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                  {patch.isFeatured && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Featured</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <Badge className={`text-xs ${getCategoryColor(patch.category)}`}>
                    {patch.category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="font-medium text-green-600">€{patch.price.toFixed(2)}</span>
                  {patch.description && (
                    <span className="truncate max-w-xs">{patch.description}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(patch)}
                className="h-8 w-8 p-0 hover:bg-blue-50"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(patch._id, patch.title)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        </div>
    </>
  );

  const renderFormView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {mode === "create" ? "Create New Patch" : `Edit: ${editingPatch?.title}`}
        </h3>
      </div>
      
      <Separator />
      
      <div className="h-[85vh] overflow-y-auto">

      <PatchForm
        isDialog={true}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        initialData={editingPatch}
      />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetAndClose();
      } else {
        setOpen(newOpen);
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[90vw] h-[90vh] !max-w-none !max-h-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Patch Management</DialogTitle>
          <DialogDescription>
            Manage global patches for products
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 overflow-hidden">
          {mode === "list" ? renderListView() : renderFormView()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 