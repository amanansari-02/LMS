import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SkillService from "@/services/SkillService";
import { HttpStatusCode } from "axios";
import { toast } from "sonner";
import type { ISKILL } from "@/interface/skill";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Pagination } from "@/components/pagination";

const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function Skill() {
  const [searchValue, setSearchValue] = useState("");
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [skills, setSkills] = useState<ISKILL[]>([]);
  const [editingSkill, setEditingSkill] = useState<ISKILL | null>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // items per page

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
    },
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchSkills = async () => {
    setViewLoading(true);
    try {
      const res = await SkillService.showSkills();
      setSkills(res.data.skills || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch skills.");
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const onSubmit = async (data: z.infer<typeof skillSchema>) => {
    setLoading(true);
    try {
      if (editingSkill) {
        const res = await SkillService.editSkill(data, editingSkill.id);
        if (res.data.status === HttpStatusCode.BadRequest) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setEditingSkill(null);
          setAddSkillOpen(false);
        }
      } else {
        const res = await SkillService.skillCreate(data);
        if (res.data.status === HttpStatusCode.BadRequest) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setAddSkillOpen(false);
        }
      }
      fetchSkills();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await SkillService.deleteSkill(deleteId ?? 0);
      if (res.data.status === HttpStatusCode.BadRequest) {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message);
        setIsDelete(false);
        fetchSkills();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete skill.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!addSkillOpen) {
      form.reset();
      setEditingSkill(null);
    }
  }, [addSkillOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage);

  const paginatedSkills = filteredSkills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 ">
      {/* Add/Edit Skill Modal */}
      <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#4B0082]">
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="Data Analysis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAddSkillOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* for delete */}
      <ConfirmationDialog
        isOpen={isDelete}
        setIsOpen={setIsDelete}
        title={"Delete this skill"}
        description={
          <>
            <p>Are you sure you want delete this skill?</p>
          </>
        }
        isLoading={isLoading}
        isDisabled={isLoading}
        successAction={handleDelete}
        successLabel={"Delete Skill"}
        successLoadingLabel={"Deleting Skill"}
        successVariant={"destructive"}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#4B0082]">
          Skills
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search skills..."
              className="pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Add Skill Button */}
          <Button
            onClick={() => setAddSkillOpen(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-lg border border-gray-200 shadow-sm overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#F3E8FF] text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Skill Name</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {viewLoading ? (
              <tr>
                <td colSpan={3} className="h-24 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginatedSkills.length > 0 ? (
              paginatedSkills.map((skill) => (
                <tr
                  key={skill.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 font-medium">{skill.name}</td>
                  <td className="px-4 py-2">
                    {formatDate(skill.created_at ?? "")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingSkill(skill);
                            setAddSkillOpen(true);
                            form.setValue("name", skill.name);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsDelete(true);
                            setDeleteId(skill.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="h-24 text-center text-gray-500">
                  No skills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
