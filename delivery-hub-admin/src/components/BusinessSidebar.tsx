import { LayoutDashboard, UtensilsCrossed, ClipboardList, DollarSign, Store } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
    { title: "Dashboard", url: "/business/dashboard", icon: LayoutDashboard },
    { title: "Mi Menú", url: "/business/menu", icon: UtensilsCrossed },
    { title: "Pedidos", url: "/business/orders", icon: ClipboardList },
    { title: "Finanzas", url: "/business/finance", icon: DollarSign },
];

export function BusinessSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-r border-border">
            <SidebarHeader className="border-b border-border p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Store className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground">Portal Aliados</span>
                        <span className="text-xs text-muted-foreground">Panel de Negocio</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Gestión</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            end
                                            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent"
                                            activeClassName="bg-sidebar-accent font-medium text-sidebar-primary"
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
