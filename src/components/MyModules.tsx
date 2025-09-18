import ModuleService from "@/services/ModuleService";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import ModuleDetails from "./ModuleDeatils";
import { useNavigate } from "react-router-dom";
import type { ISKILL } from "@/interface/skill";

export default function MyModules() {
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [moduleCount, setModuleCount] = useState(0);
  const [selectedModule] = useState<any | null>(null);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();

  const getModules = async () => {
    setIsLoading(true);
    try {
      const res = await ModuleService.getOurModules(user.id);
      setModules(res.data.data || []);
      setModuleCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching trending modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModule = async (module: any) => {
    try {
      navigate(`/modules/${module.id}`);
    } catch (error) {
      console.error("Error starting module tracking:", error);
    }
  };

  useEffect(() => {
    getModules();
  }, []);

  if (selectedModule) {
    // Show ModuleDetails if a module is clicked
    return <ModuleDetails />;
  }

  return (
    <div className="bg-gray-200">
      {modules.length > 0 && (
        <>
          {/* Title */}
          <div className="mt-2 p-4">
            <div className="text-lg text-start font-semibold">
              My To-Do {moduleCount && `(${moduleCount})`}
            </div>
            <div className="w-20 h-1 bg-orange-500 mt-1 rounded"></div>
          </div>

          {/* Responsive Grid */}
          <div className="p-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 p-1 rounded-sm shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-40 bg-gray-200 rounded-t-sm"></div>
                    <div className="p-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="flex gap-2 mb-3">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))
              : modules.map((data: any) => (
                  <div
                    key={data.module.id}
                    onClick={() => handleOpenModule(data.module)}
                    className="cursor-pointer bg-white border border-gray-100 p-1 rounded-sm shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    <img
                      className="w-full h-40 object-cover rounded-t-sm"
                      src={data.module.image_link}
                      alt="Image"
                    />

                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-start">
                        {data.module.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {data.module.skill_details
                          .slice(0, 2)
                          .map((skill: ISKILL, index: number) => (
                            <Badge key={index}>{skill.name}</Badge>
                          ))}
                        {data.module.skill_details.length > 2 && (
                          <Badge className="bg-gray-200 text-gray-700">
                            +{data.module.skill_details.length - 2} more
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mt-3 text-sm text-start line-clamp-3">
                        {data.module.description &&
                        data.module.description.length > 100
                          ? data.module.description.slice(0, 100) + "..."
                          : data.module.description}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
