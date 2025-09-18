import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/disprz-logo.svg";
import { Input } from "./ui/input";
import {
  ChevronDown,
  ChevronLeft,
  Clock,
  FileCheck,
  Loader2,
  LogOut,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { formatVideoTime, getInitials } from "@/utils/common-functions";
import { useSearch } from "@/context/SearchContext";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import ModuleService from "@/services/ModuleService";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Badge } from "./ui/badge";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();
  const { search, setSearch } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const completedModules = async () => {
    setIsLoading(true);
    try {
      const res = await ModuleService.completedModules(user.id);
      setModules(res.data || []);
    } catch (erorr) {
      console.log("error", erorr);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      completedModules();
    }
  }, [isOpen]);

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 bg-white shadow">
      {/* Left: Logo */}

      <div className="flex items-center mb-2 md:mb-0">
        {location.pathname === "/modules" && (
          <div className="cursor-pointer" onClick={() => navigate("dashboard")}>
            <ChevronLeft className="mr-6 h-8 w-8 text-primary" />
          </div>
        )}
        <img src={logo} alt="Logo" className="w-24 md:w-28" />
      </div>

      {/* Right: Search + All Modules + Profile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-6 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:flex-none">
          <Input
            type="text"
            placeholder="Search for modules, skills, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {/* All Modules */}
        <button
          onClick={() => navigate("/modules")}
          className="text-gray-700 uppercase font-medium hover:text-primary hover:cursor-pointer whitespace-nowrap"
        >
          All Modules
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar>
                <AvatarFallback className="bg-[#4fc25f] text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <p className="text-black flex items-center justify-center whitespace-nowrap">
                {user?.first_name} {user?.last_name}
                <ChevronDown className="h-3 w-3 ml-1 flex mt-1" />
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <FileCheck />
              Completed Modules
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Completed Modules</DialogTitle>
          </DialogHeader>
          <Separator />

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : modules.length > 0 ? (
            <div className="flex flex-col gap-2">
              {modules.map((module: any) => (
                <div
                  key={module.id}
                  className="bg-white shadow-md hover:cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition duration-300 text-sm "
                >
                  <div className="grid sm:grid-cols-[30%_70%] grid-cols-1 gap-2 p-3">
                    {/* Left side image */}
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={module.module.image_link}
                        alt={module.module.title}
                        className="w-full h-20 sm:h-24 md:h-32 lg:h-40 object-cover rounded-md"
                      />
                    </div>

                    {/* Right side content */}
                    <div className="flex flex-col">
                      {/* Title */}
                      <h2 className="font-bold text-gray-800 text-left">
                        {module.module.title}
                      </h2>

                      {/* Description */}
                      <p className="text-gray-600 text-xs mt-2 line-clamp-2 text-left">
                        {module.module.description}
                      </p>

                      {/* Bottom section */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {/* Video time */}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatVideoTime(module.module.video_time)}
                          </span>
                        </div>

                        {/* Skills */}
                        <Collapsible className="flex items-center gap-1">
                          {module.module.skill_details
                            .slice(0, 1)
                            .map((skill: any, index: number) => (
                              <Badge
                                key={index}
                                className="text-[10px] px-1.5 py-0.5"
                              >
                                {skill.name}
                              </Badge>
                            ))}

                          {module.module.skill_details.length > 1 && (
                            <CollapsibleTrigger asChild>
                              <Badge className="bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300 flex items-center gap-1 text-[10px] px-1.5 py-0.5">
                                +{module.module.skill_details.length - 1} more
                                <ChevronDown className="w-2 h-2" />
                              </Badge>
                            </CollapsibleTrigger>
                          )}

                          <CollapsibleContent className="flex flex-wrap gap-1 mt-1">
                            {module.module.skill_details
                              .slice(1)
                              .map((skill: any, idx: number) => (
                                <Badge
                                  key={idx + 1}
                                  className="bg-primary text-[10px] px-1.5 py-0.5"
                                >
                                  {skill.name}
                                </Badge>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Completed At */}
                        <div className="ml-auto flex items-center">
                          <Badge className="bg-green-100 text-green-500 text-[11px]">
                            <Clock className="w-3 h-3 mr-1" />
                            Completed on{" "}
                            {new Date(
                              module.last_updated_at
                            ).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-gray-700">No modules completed yet.</p>
            </div>
          )}
          {/* Replace this with actual completed modules */}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
