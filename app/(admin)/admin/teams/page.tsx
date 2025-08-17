"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeams, type Team } from "@/hooks/useTeams";
import { TeamDataTable } from "@/components/admin/TeamDataTable";
import { EditTeamModal } from "@/components/admin/EditTeamModal";
import { DeleteTeamModal } from "@/components/admin/DeleteTeamModal";
import { CreateTeamModal } from "@/components/admin/CreateTeamModal";
import { Loader2, Plus, Search, Filter } from "lucide-react";

export default function AdminTeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamIdToDelete, setTeamIdToDelete] = useState<string | null>(null);
  const [teamNameToDelete, setTeamNameToDelete] = useState("");

  // Use the optimized teams hook
  const {
    teams,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentLimit,
    setCurrentLimit,
    isInternationalFilter,
    setIsInternationalFilter,
    isActiveFilter,
    setIsActiveFilter,
    refreshTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    reorderTeams,
    toggleTeamStatus,
    clearError,
  } = useTeams({
    initialPage: 1,
    initialLimit: 10,
  });

  // Redirect if not admin
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    router.push("/");
    return null;
  }

  const handleCreateTeam = async (teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTeam(teamData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const handleEditTeam = (team: Team) => {
    setCurrentTeam(team);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = async (teamData: Partial<Team>) => {
    if (!currentTeam) return;
    
    try {
      await updateTeam(currentTeam._id, teamData);
      setIsEditModalOpen(false);
      setCurrentTeam(null);
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamIdToDelete(team._id);
    setTeamNameToDelete(team.name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teamIdToDelete) return;
    
    try {
      await deleteTeam(teamIdToDelete);
      setIsDeleteModalOpen(false);
      setTeamIdToDelete(null);
      setTeamNameToDelete("");
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleToggleStatus = async (teamId: string) => {
    try {
      await toggleTeamStatus(teamId);
    } catch (error) {
      console.error("Error toggling team status:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "isInternational") {
      setIsInternationalFilter(value === "all" ? null : value === "true");
    } else if (filter === "isActive") {
      setIsActiveFilter(value === "all" ? null : value === "true");
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const domesticTeams = teams.filter(team => !team.isInternational);
  const internationalTeams = teams.filter(team => team.isInternational);
  
  const stats = {
    total: pagination.total,
    international: internationalTeams.length,
    domestic: domesticTeams.length,
    active: teams.filter(team => team.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams Management</h1>
          <p className="text-muted-foreground">
            Manage football teams and their shop configurations
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Team
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">International</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.international}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Domestic (Serie A)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.domestic}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              onClick={clearError}
              className="ml-2 p-0 h-auto"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Teams Tabs */}
      <Tabs defaultValue="domestic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domestic" className="flex items-center gap-2">
            🇮🇹 Serie A Teams ({stats.domestic})
          </TabsTrigger>
          <TabsTrigger value="international" className="flex items-center gap-2">
            🌍 International Teams ({stats.international})
          </TabsTrigger>
        </TabsList>

        {/* Domestic Teams Tab */}
        <TabsContent value="domestic" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Serie A Teams</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Serie A Team
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search for Domestic Teams */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search Serie A teams..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={isActiveFilter === null ? "all" : isActiveFilter.toString()}
                  onValueChange={(value) => handleFilterChange("isActive", value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                                            <TeamDataTable
                 teams={domesticTeams}
                 pagination={pagination}
                 isLoading={isLoading}
                 onEdit={handleEditTeam}
                 onDelete={handleDeleteClick}
                 onToggleStatus={handleToggleStatus}
                 onPageChange={setCurrentPage}
                 onLimitChange={setCurrentLimit}
                 onReorder={reorderTeams}
                 isDomestic={true}
               />
            </CardContent>
          </Card>
        </TabsContent>

        {/* International Teams Tab */}
        <TabsContent value="international" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>International Teams</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add International Team
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search for International Teams */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search international teams..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={isActiveFilter === null ? "all" : isActiveFilter.toString()}
                  onValueChange={(value) => handleFilterChange("isActive", value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="w-40">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                                            <TeamDataTable
                 teams={internationalTeams}
                 pagination={pagination}
                 isLoading={isLoading}
                 onEdit={handleEditTeam}
                 onDelete={handleDeleteClick}
                 onToggleStatus={handleToggleStatus}
                 onPageChange={setCurrentPage}
                 onLimitChange={setCurrentLimit}
                 onReorder={reorderTeams}
                 isDomestic={false}
               />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateTeam}
      />

      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentTeam(null);
        }}
        onConfirm={handleUpdateTeam}
        team={currentTeam}
      />

      <DeleteTeamModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTeamIdToDelete(null);
          setTeamNameToDelete("");
        }}
        onConfirm={handleConfirmDelete}
        teamName={teamNameToDelete}
      />
    </div>
  );
} 