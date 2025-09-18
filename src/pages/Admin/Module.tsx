import AddModule from "@/components/Module/add-module";
import EditModule from "@/components/Module/edit-module";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModuleService from "@/services/ModuleService";
import { Search, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import type { IModule, IModuleView } from "@/interface/module";

export default function Module() {
  const [modules, setModules] = useState<IModule[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<IModule | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await ModuleService.getModules();
      setModules(res.data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      toast.error("Failed to fetch modules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const refreshModules = () => {
    fetchModules();
  };

  const handleEditModule = (module: IModule) => {
    setEditingModule(module);
    setIsEditOpen(true);
  };

  const handleDeleteModule = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await ModuleService.deleteModule(deleteId);
      toast.success("Module deleted successfully!");
      refreshModules();
      setIsDeleteOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete module");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#4B0082]">
          Modules
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search modules..."
              className="pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Add module */}
          <AddModule refreshModules={refreshModules} />
        </div>
      </div>
      <div className="mt-6 rounded-lg border border-gray-200 shadow-sm overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F3E8FF] text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Video Time (s)</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredModules = modules.filter((m) => {
                const search = searchValue.toLowerCase();

                return (
                  m.title.toLowerCase().includes(search) ||
                  m.description.toLowerCase().includes(search) ||
                  m.video_time.toString().includes(search) // ✅ match video_time too
                );
              });

              if (loading) {
                return (
                  <tr>
                    <td colSpan={5} className="h-24 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                );
              }

              if (filteredModules.length === 0) {
                return (
                  <tr>
                    <td colSpan={5} className="h-24 text-center text-gray-500">
                      {modules.length === 0
                        ? "No modules found"
                        : "No modules match your search"}
                    </td>
                  </tr>
                );
              }

              return filteredModules.map((module) => (
                <tr
                  key={module.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium">{module.title}</td>
                  <td className="px-6 py-4">{module.description}</td>
                  <td className="px-6 py-4">{module.video_time}</td>
                  <td className="px-6 py-4">
                    {new Date(module.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditModule(module)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteId(module.id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Edit Module Dialog */}
      {editingModule && editingModule.id && (
        <EditModule
          module={editingModule as IModuleView}
          refreshModules={refreshModules}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingModule(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete Module"
        description="Are you sure you want to delete this module? This action cannot be undone."
        successAction={handleDeleteModule}
        successLabel="Delete"
        successLoadingLabel="Deleting..."
        isLoading={isDeleting}
        successVariant="destructive"
      />
    </div>
  );
}
