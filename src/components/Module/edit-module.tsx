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
import { Loader2, X } from "lucide-react";
import ModuleService from "@/services/ModuleService";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Label } from "../ui/label";
import { MultiSelect } from "../multi-select";
import SkillService from "@/services/SkillService";
import type { ISKILL } from "@/interface/skill";
import type { IModule, IModuleView } from "@/interface/module";

// Zod schema for edit module
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const editModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  video_time: z
    .number({ message: "Video time must be a number" })
    .min(1, "Video time must be at least 1 second"),
  image: z
    .custom<File | undefined>(
      (val) => val instanceof File || val === undefined,
      {
        message: "Invalid image file",
      }
    )
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, {
      message: "Image must be less than 5MB",
    })
    .optional(),
});

type FormData = z.infer<typeof editModuleSchema>;

interface EditModuleProps {
  module: IModuleView;
  refreshModules: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditModule({
  module,
  refreshModules,
  isOpen,
  onClose,
}: EditModuleProps) {
  // Safety check
  if (!module || !module.id) {
    console.error("EditModule: Invalid module data", module);
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-[#4B0082]">
              Edit Module
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 text-center text-red-500">
            Error: Invalid module data
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | undefined>(undefined);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string>("");
  const [, setImageFile] = useState<string | null>(null);
  const [skills, setSkills] = useState<ISKILL[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string[]>(
    module?.skills || []
  );
  const [isInvalidSkill, setIsInvalidSkill] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [fullModuleData, setFullModuleData] = useState<IModule | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(editModuleSchema),
    defaultValues: {
      title: module.title,
      description: module.description,
      video_time: module.video_time,
    },
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // Get video duration automatically
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        form.setValue("video_time", Math.floor(video.duration));
      };
      // Revoke any previous object URL
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
      const newUrl = URL.createObjectURL(file);
      setVideoObjectUrl(newUrl);
      video.src = newUrl;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImage(file);
      form.setValue("image", file);
      form.clearErrors("image");
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
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
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
    if (videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
      setVideoObjectUrl("");
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

      // Ensure skills are properly formatted
      if (selectedSkill.length > 0) {
        selectedSkill.forEach((skill) => formData.append("skills[]", skill));
      }

      formData.append("video_time", data.video_time.toString());

      if (data.image) {
        formData.append("image", data.image);
      }

      if (videoFile) {
        formData.append("video", videoFile);
      }

      formData.append("_method", "PUT");
      await ModuleService.updateModule(formData, module.id);

      onClose();
      form.reset();
      refreshModules();
      toast.success("Module updated successfully!");
      // Reset files
      setImageFile(null);
      setVideoFile(null);
      setImage(undefined);
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSkills();
  }, []);

  useEffect(() => {
    if (isOpen && module) {
      const fetchModuleData = async () => {
        try {
          // Fetch full module data including skills
          const response = await ModuleService.getModule(module.id);
          const fullModuleData = response.data;

          // Reset form with module data when opening
          form.reset({
            title: fullModuleData.title || module.title || "",
            description: fullModuleData.description || module.description || "",
            video_time: fullModuleData.video_time || module.video_time || 0,
          });

          // Handle image URL - prepend server URL if it's a relative path

          setExistingImageUrl(module.image_link);

          // Handle video URL - prepend server URL if it's a relative path

          setExistingVideoUrl(module.video_link);

          // Store the full module data for skills processing
          setFullModuleData(fullModuleData);

          // Reset file states
          setImage(undefined);
          setVideoFile(null);
          setImageFile(null);
          setIsInvalidSkill(false);
        } catch (error) {
          console.error("Error fetching module data:", error);
          // Fallback to using the passed module data
          form.reset({
            title: module.title || "",
            description: module.description || "",
            video_time: module.video_time || 0,
          });

          const imageUrl = module.image || "";
          const fullImageUrl = imageUrl.startsWith("http")
            ? imageUrl
            : imageUrl
            ? `${import.meta.env.VITE_API_URL}${imageUrl}`
            : "";
          setExistingImageUrl(fullImageUrl);

          const videoUrl = module.video || "";
          const fullVideoUrl = videoUrl.startsWith("http")
            ? videoUrl
            : videoUrl
            ? `${import.meta.env.VITE_API_URL}${videoUrl}`
            : "";
          setExistingVideoUrl(fullVideoUrl);
        }
      };

      fetchModuleData();
    }
  }, [isOpen, module, form]);

  // Separate useEffect to handle skills after they are loaded
  useEffect(() => {
    if (isOpen && (fullModuleData || module) && skills.length > 0) {
      try {
        const moduleToUse = fullModuleData || module;
        // Pre-populate skills if they exist
        if (
          moduleToUse.skills &&
          Array.isArray(moduleToUse.skills) &&
          moduleToUse.skills.length > 0
        ) {
          //   const skillIds = moduleToUse.skills.map((skill) => {
          //     if (typeof skill === "object" && skill.id) {
          //       return skill.id.toString();
          //     }
          //     return skill.toString();
          //   });
        } else {
          console.log("No skills found, setting empty array");
          // setSelectedSkill([]);
        }
      } catch (error) {
        console.error("Error setting skills:", error);
        // setSelectedSkill([]);
      }
    }
  }, [isOpen, fullModuleData, module, skills]);

  useEffect(() => {
    if (selectedSkill.length) {
      setIsInvalidSkill(false);
    }
  }, [selectedSkill]);

  // Cleanup when form closes
  useEffect(() => {
    if (!isOpen) {
      setFullModuleData(null);
      // setSelectedSkill([]);
      setExistingImageUrl("");
      setExistingVideoUrl("");
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl("");
      }
      if (videoObjectUrl) {
        URL.revokeObjectURL(videoObjectUrl);
        setVideoObjectUrl("");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getSkills();
      setImage(undefined);
    } else {
      form.reset();
      setSelectedSkill(module?.skills || []);
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full !max-w-full md:w-[500px] md:!max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-[#4B0082]">
            Edit Module
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form className="space-y-6 px-4 mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Title *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter module title"
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter module description"
                      className="mt-1 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Skills *
              </Label>

              <MultiSelect
                options={skills.map((skill) => ({
                  label: skill.name,
                  value: skill.id.toString(),
                }))}
                // selected={selectedSkill}
                onValueChange={setSelectedSkill}
                defaultValue={selectedSkill}
                placeholder="Select skills"
                className="mt-1"
              />
              {isInvalidSkill && (
                <p className="text-sm text-red-500">
                  Please select at least one skill
                </p>
              )}
            </div>

            {/* <FormField
                            control={form.control}
                            name="video_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Video Time (seconds) *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="Enter video duration in seconds"
                                            className="mt-1"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Module Image
              </Label>
              <div className="mt-1">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Show existing image if available and no new selection */}
                {existingImageUrl && !image && !imagePreviewUrl && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500">
                      Current Image:
                    </Label>
                    <div className="mt-1 p-2 border rounded-md bg-gray-50 flex justify-center items-center">
                      <img
                        src={existingImageUrl}
                        alt="Current module image"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            existingImageUrl
                          );
                          e.currentTarget.style.display = "none";
                        }}
                        // onLoad={() => {
                        //   console.log(
                        //     "Image loaded successfully:",
                        //     existingImageUrl
                        //   );
                        // }}
                      />
                    </div>
                  </div>
                )}

                {/* Show preview if new image selected */}
                {imagePreviewUrl && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500">
                      New Image Preview:
                    </Label>
                    <div className="mt-1 p-2 border rounded-md bg-gray-50 flex justify-center items-center">
                      <img
                        src={imagePreviewUrl}
                        alt="New module image preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full"
                >
                  {image
                    ? image.name
                    : existingImageUrl
                    ? "Change Image"
                    : "Choose Image"}
                </Button>

                {image && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">{image.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Module Video
              </Label>
              <div className="mt-1">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />

                {/* Show existing video if available */}
                {existingVideoUrl && !videoFile && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500">
                      Current Video:
                    </Label>
                    <div className="mt-1 p-2 border rounded-md bg-gray-50">
                      <video
                        src={existingVideoUrl}
                        controls
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          console.error(
                            "Video failed to load:",
                            existingVideoUrl
                          );
                          e.currentTarget.style.display = "none";
                        }}
                        // onLoad={() => {
                        //   console.log(
                        //     "Video loaded successfully:",
                        //     existingVideoUrl
                        //   );
                        // }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full"
                >
                  {videoFile
                    ? videoFile.name
                    : existingVideoUrl
                    ? "Change Video"
                    : "Choose Video"}
                </Button>

                {videoFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {videoFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={validateForm}
                disabled={isLoading}
                className="flex-1 bg-[#4B0082] hover:bg-[#4B0082]/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Module"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
