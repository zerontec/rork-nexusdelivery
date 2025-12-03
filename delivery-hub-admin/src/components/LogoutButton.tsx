import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            toast.success("Sesión cerrada correctamente");
            navigate("/login");
        } catch (error: any) {
            toast.error("Error al cerrar sesión: " + error.message);
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
            <LogOut className="h-5 w-5" />
        </Button>
    );
}
