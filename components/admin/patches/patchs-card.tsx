import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PatchManagementDialog } from "./PatchManagementDialog";
import { Button } from "@/components/ui/button";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Controller, Control } from "react-hook-form";
import { usePatches } from "@/hooks/usePatches";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TagIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PatchsCardProps {
  control: Control<any>;
}

export const PatchsCard = ({ control }: PatchsCardProps) => {
  const { patches, loading } = usePatches();
  
  return (
    <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">Available Patches</CardTitle>
        <PatchManagementDialog>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Cog6ToothIcon className="h-4 w-4" />
          </Button>
        </PatchManagementDialog>
      </div>
    </CardHeader>
    <CardContent className="py-3">
      <div className="space-y-3">
        <Controller
          name="patchIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : patches.length === 0 ? (
                <div className="text-center py-4 text-white/50">
                  <TagIcon className="mx-auto h-8 w-8 text-white/40" />
                  <p className="mt-2 text-xs text-white/50">No patches available</p>
                </div>
                                         ) : (
                 <ScrollArea className="h-[200px]">
                   <div className="space-y-2 pr-4">
                     {patches.map((patch) => (
                       <div 
                         key={patch._id} 
                         className={`
                           flex items-center justify-between p-2 rounded border cursor-pointer transition-colors
                           ${field.value?.includes(patch._id) 
                             ? 'border-[#c8f000] bg-orange-50' 
                             : 'border-white/8 hover:bg-[#0a0a0a]'
                           }
                         `}
                         onClick={() => {
                           const currentPatches = field.value || [];
                           if (currentPatches.includes(patch._id)) {
                             field.onChange(currentPatches.filter((id: string) => id !== patch._id));
                           } else {
                             field.onChange([...currentPatches, patch._id]);
                           }
                         }}
                       >
                         <div className="flex items-center space-x-3 flex-1 min-w-0">
                           <div className="w-8 h-8 rounded overflow-hidden bg-[#111] flex-shrink-0">
                             <img
                               src={patch.imageUrl}
                               alt={patch.title}
                               className="w-full h-full object-cover"
                             />
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center space-x-2">
                               <span className="text-sm font-medium text-white truncate">
                                 {patch.title}
                               </span>
                               <Badge variant="outline" className="text-xs">
                                 {patch.category.replace('-', ' ')}
                               </Badge>
                               <span className="text-sm font-medium text-green-600">
                                 €{patch.price.toFixed(2)}
                               </span>
                             </div>
                           </div>
                         </div>
                         
                         <div className={`
                           w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                           ${field.value?.includes(patch._id)
                             ? 'bg-[#c8f000] border-[#c8f000] text-white'
                             : 'border-white/10'
                           }
                         `}>
                           {field.value?.includes(patch._id) && (
                             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               )}
              {field.value && field.value.length === 0 && (
                <p className="text-xs text-muted-foreground">No patches selected</p>
              )}
            </div>
          )}
        />
      </div>
    </CardContent>
  </Card>
  );
};