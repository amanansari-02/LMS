import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Plus, Loader2, X } from "lucide-react";
import ModuleService from "@/services/ModuleService";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Label } from "../ui/label";
import { MultiSelect } from "../multi-select";
import SkillService from "@/services/SkillService";
import type { ISKILL } from "@/interface/skill";
// import type { IMODULEPAYLOAD } from "@/interface/module";

// Zod schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  video_time: z
    .number({ message: "Video time must be a number" })
    .min(1, "Video time must be at least 1 second"),
  image: z
    .custom<File | undefined>((val) => val instanceof File, {
      message: "Category image is required",
    })
    .refine((file) => file && file?.size <= MAX_FILE_SIZE, {
      message: "Logo must be less than 5MB",
    }),
});

type FormData = z.infer<typeof moduleSchema>;

export default function AddModule({
  refreshModules,
}: {
  refreshModules: () => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      description: "",
      video_time: 0,
      image: undefined,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [image, setImage] = useState<File | undefined>(undefined);
  const handleClickImage = () => imageInputRef.current?.click();
  const [isInvalidSkill, setIsInvalidSkill] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<string[]>([]);
  const [skills, setSkills] = useState<ISKILL[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoClick = () => videoInputRef.current?.click();
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);

      // Get video duration automatically
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        form.setValue("video_time", Math.floor(video.duration)); // auto set video_time
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      form.setValue("image", file);
      form.clearErrors("image");
    }
  };

  const getSkills = async () => {
    try {
      const response = await SkillService.showSkills();
      setSkills(response.data.skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    form.setValue("image", undefined);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const validateForm = async () => {
    if (!selectedSkill.length) {
      setIsInvalidSkill(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      selectedSkill.forEach((skill) => formData.append("skills[]", skill));
      formData.append("video_time", data.video_time.toString());

      if (data.image) formData.append("image", data.image);
      if (videoFile) formData.append("video", videoFile);

      await ModuleService.createModule(formData);

      setSheetOpen(false);
      form.reset();
      refreshModules();
      toast.success("Module created successfully!");
      // Optionally, reset form and files
      setImageFile(null);
      setVideoFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create module");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSkills();
  }, []);

  useEffect(() => {
    form.reset();
    setImage(undefined);
    setVideoFile(null);
    setImageFile(null);
    setSelectedSkill([]);
  }, [sheetOpen]);

  useEffect(() => {
    if (selectedSkill.length) {
      setIsInvalidSkill(false);
    }
  }, [selectedSkill]);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus /> Create Module
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full !max-w-full md:w-[500px] md:!max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-primary font-bold text-lg Poppins">
            Add New Module
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 mb-6">
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel className="Poppins">
                    Upload Module Image *
                  </FormLabel>
                  <div
                    className="border border-primary mt-2 h-60 rounded-2xl border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative bg-gray-50"
                    onClick={handleClickImage}
                  >
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/jpg"
                      ref={imageInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Selected"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-1 px-4 text-gray-500">
                        <div className="Poppins">
                          File type is JPEG, PNG, JPG
                        </div>
                        <div className="Poppins">File Size 5mb</div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                  <div className="mt-3 flex items-center justify-center">
                    <Button
                      type="button"
                      className="rounded-3xl"
                      onClick={handleClickImage}
                    >
                      <Plus className="h-4 w-4 Poppins" /> Module Image
                    </Button>
                    {image && (
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-4 rounded-3xl"
                        onClick={handleRemoveImage}
                      >
                        <X className="mr-2 h-4 w-4 Poppins" /> Remove
                      </Button>
                    )}
                  </div>
                </FormItem>
              )}
            />

            <div className="mt-6 grid gap-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="Poppins">Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter module title"
                        className="Poppins"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 grid gap-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="Poppins">Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter module description"
                        className="Poppins"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 grid gap-2">
              <Label
                className={`poppins ${
                  isInvalidSkill ? "text-destructive" : ""
                }`}
              >
                Select skills *
              </Label>
              <MultiSelect
                options={skills?.map((skill) => ({
                  label: skill.name,
                  value: skill.id.toString(),
                }))}
                onValueChange={setSelectedSkill}
                defaultValue={selectedSkill}
                placeholder="Select options"
                variant="inverted"
                animation={2}
                maxCount={3}
              />
              {isInvalidSkill ? (
                <FormMessage className="mt-2">
                  Please select at least one skill
                </FormMessage>
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="video_time"
              render={() => (
                <FormItem>
                  <FormLabel className="Poppins mt-3">
                    Upload Module Video *
                  </FormLabel>
                  <div
                    className="border border-primary mt-2 h-60 rounded-2xl border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative bg-gray-50"
                    onClick={handleVideoClick}
                  >
                    <input
                      type="file"
                      accept="video/mp4,video/mov,video/avi"
                      ref={videoInputRef}
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                    {videoFile ? (
                      <video
                        src={URL.createObjectURL(videoFile)}
                        controls
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-1 px-4 text-gray-500">
                        <div className="Poppins">Supported: MP4, MOV, AVI</div>
                        <div className="Poppins">Max Size: 50MB</div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                  {videoFile && (
                    <div className="mt-3 flex items-center justify-center">
                      <Button
                        type="button"
                        className="rounded-3xl"
                        onClick={handleVideoClick}
                      >
                        <Plus className="h-4 w-4 Poppins" /> Change Video
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-4 rounded-3xl"
                        onClick={() => setVideoFile(null)}
                      >
                        <X className="mr-2 h-4 w-4 Poppins" /> Remove
                      </Button>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="mt-6 w-full flex justify-end gap-2">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full rounded-3xl md:w-fit Poppins"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                // type="submit"
                onClick={validateForm}
                size="lg"
                className="w-full rounded-3xl md:w-fit Poppins"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Creating" : "Create"} Module
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
