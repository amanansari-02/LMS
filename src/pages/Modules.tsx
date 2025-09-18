import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSearch } from "@/context/SearchContext";
import ModuleService from "@/services/ModuleService";
import { formatVideoTime } from "@/utils/common-functions";
import { ChevronDown, Clock, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Modules() {
  const [modules, setModules] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "")
    : null;
  const { search } = useSearch();

  const getModulesDetails = async () => {
    setIsLoading(true);
    try {
      const response = await ModuleService.getModules();
      setModules(response.data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModules = modules.filter((module: any) => {
    const query = search.toLowerCase();

    const inTitle = module.title.toLowerCase().includes(query);
    const inDescription = module.description.toLowerCase().includes(query);
    const inSkills = module.skill_details.some((skill: any) =>
      skill.name.toLowerCase().includes(query)
    );

    return inTitle || inDescription || inSkills;
  });

  useEffect(() => {
    getModulesDetails();
  }, []);

  const moduleDetails = async (module: any) => {
    const res = await ModuleService.checkModuleTrackingExists(
      user?.id,
      Number(module.id)
    );
    if (res.data.exists) {
      navigate(`/modules/${module.id}`, { state: { module } });
    } else {
      await ModuleService.startModuleTracking(Number(module.id), user?.id);
      navigate(`/modules/${module.id}`, { state: { module } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
      </div>
    );
  }

  return (
    <div>
      {filteredModules.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-600">No modules available.</p>
        </div>
      ) : (
        <div className="p-5 px-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModules.map((module: any) => (
            <div
              key={module.id}
              onClick={() => {
                moduleDetails(module);
              }}
              className="bg-white shadow-md hover:cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition duration-300"
            >
              <div className="grid sm:grid-cols-[30%_70%] grid-cols-1 gap-2 p-4">
                {/* Left side image */}
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={module.image_link}
                    alt={module.title}
                    className="w-full h-28 object-cover rounded-md"
                  />
                </div>

                {/* Right side content */}
                <div className="flex flex-col">
                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-800 text-left">
                    {module.title}
                  </h2>

                  {/* Description */}
                  <p
                    title={module.description}
                    className="text-gray-600 text-sm mt-3  line-clamp-3 text-left"
                  >
                    {module.description && module.description.length > 100
                      ? module.description.slice(0, 100) + "..."
                      : module.description}
                  </p>

                  {/* Bottom section */}
                  <div className="flex items-center gap-4 mt-[5%] text-sm text-gray-500">
                    {/* Video time */}
                    <div className="flex items-center gap-1 ">
                      <Clock className="w-4 h-4" />
                      <span>{formatVideoTime(module.video_time)} </span>
                    </div>

                    {/* Skills */}
                    <Collapsible className="mt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Show first skill */}
                        {module.skill_details
                          .slice(0, 1)
                          .map((skill: any, index: number) => (
                            <Badge key={index}>{skill.name}</Badge>
                          ))}

                        {/* If more than 1 → show collapsible trigger */}
                        {module.skill_details.length > 1 && (
                          <CollapsibleTrigger asChild>
                            <Badge className="bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300 flex items-center gap-1">
                              +{module.skill_details.length - 1} more
                              <ChevronDown className="w-3 h-3" />
                            </Badge>
                          </CollapsibleTrigger>
                        )}
                      </div>

                      {/* Expanded skills */}
                      <CollapsibleContent className="mt-2 flex flex-wrap gap-2">
                        {module.skill_details
                          .slice(1)
                          .map((skill: any, idx: number) => (
                            <Badge key={idx + 1} className=" bg-primary">
                              {skill.name}
                            </Badge>
                          ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
