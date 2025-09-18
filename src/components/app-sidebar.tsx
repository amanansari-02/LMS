import * as React from "react";

import logo from "@/assets/disprz-logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { Book, Layers } from "lucide-react";

// This is sample data.
const data = {
  navMain: [
    // {
    //   title: "Workspaces",
    //   url: "/admin",
    // },
    {
      title: "Modules",
      url: "/admin/modules",
      icon: Book,
    },
    {
      title: "Skills",
      url: "/admin/skills",
      icon: Layers,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [activePath, setActivePath] = React.useState(location.pathname);

  React.useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <img src={logo} alt="Company Logo" width={150} height={50} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {/* ✅ use NavLink instead of <a> */}
                    <NavLink
                      to={item.url}
                      className={
                        activePath.startsWith(item.url)
                          ? "bg-primary text-primary-foreground font-semibold rounded-md"
                          : "hover:bg-muted rounded-md"
                      }
                    >
                      {/* Icon */}
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
