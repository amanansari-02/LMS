import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getInitials } from "@/utils/common-functions";
import { ChevronDown } from "lucide-react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();
  if (userRole !== "admin") return <Navigate to="/login" />;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // go to login page
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 bg-background mr-4 border-b border-gray-300 h-16 flex items-center px-4">
          {" "}
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 " />
          <div className="w-full flex justify-end ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar>
                    <AvatarFallback className="bg-[#4fc25f] text-white">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <p className="text-black flex items-center">
                    {user?.first_name} {user?.last_name}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* // bg-[#f5f6fb] */}
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
