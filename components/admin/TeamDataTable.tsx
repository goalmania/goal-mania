"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Team, TeamPagination } from "@/hooks/useTeams";
import { getCountryLabel } from "@/lib/constants/countries";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamDataTableProps {
  teams: Team[];
  pagination: TeamPagination;
  isLoading: boolean;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onToggleStatus: (teamId: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isDomestic?: boolean;
  onReorder?: (teams: Team[]) => void;
}

export function TeamDataTable({
  teams,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
  onLimitChange,
  isDomestic = true,
  onReorder,
}: TeamDataTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading teams...</span>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No teams found.</p>
      </div>
    );
  }

  const getTeamTypeColor = (isInternational: boolean) => {
    return isInternational ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Drag</TableHead>
              <TableHead className="w-12">Logo</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team, index) => (
              <TableRow 
                key={team._id}
                className="group hover:bg-muted/50 transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", index.toString());
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
                  const dropIndex = index;
                  
                  if (dragIndex !== dropIndex && onReorder) {
                    const newTeams = [...teams];
                    const [draggedTeam] = newTeams.splice(dragIndex, 1);
                    newTeams.splice(dropIndex, 0, draggedTeam);
                    
                    // Update display orders
                    const updatedTeams = newTeams.map((team, idx) => ({
                      ...team,
                      displayOrder: idx + 1
                    }));
                    
                    onReorder(updatedTeams);
                  }
                }}
              >
                <TableCell>
                  <div className="cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={team.logo} alt={team.name} />
                    <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{team.name}</div>
                  <div className="text-sm text-muted-foreground">{team.slug}</div>
                </TableCell>
                <TableCell>{team.nickname}</TableCell>
                <TableCell>
                  <Badge className={getTeamTypeColor(team.isInternational)}>
                    {team.isInternational ? "International" : "Serie A"}
                  </Badge>
                </TableCell>
                <TableCell>{team.league || "-"}</TableCell>
                <TableCell>{team.country ? getCountryLabel(team.country) : "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(team.isActive)}>
                    {team.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{team.displayOrder}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(team._id)}
                          className={`h-8 w-8 p-0 ${
                            team.isActive 
                              ? "text-green-600 hover:text-green-700" 
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {team.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {team.isActive ? "Deactivate Team" : "Activate Team"}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(team)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Edit Team
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(team)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Delete Team
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onLimitChange(parseInt(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 