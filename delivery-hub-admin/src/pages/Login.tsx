import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already logged in
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.role === 'business') {
                    navigate("/business/dashboard");
                } else {
                    navigate("/");
                }
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            if (!user) throw new Error("No user found");

            // Check user role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            console.log('Login Debug - User ID:', user.id);
            console.log('Login Debug - Profile:', profile);
            console.log('Login Debug - Metadata:', user.user_metadata);

            let effectiveRole = profile?.role;
            const metadataRole = user.user_metadata?.role;

            // Self-healing: Sync role from metadata if profile is missing it
            if (metadataRole === 'business' && effectiveRole !== 'business') {
                console.log('Role mismatch detected. Attempting to sync profile...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: 'business' })
                    .eq('id', user.id);

                if (!updateError) {
                    console.log('Profile synced successfully.');
                    effectiveRole = 'business';
                } else {
                    console.error('Failed to sync profile:', updateError);
                    // Fallback to metadata for redirection, assuming RLS might block update but we want to try access
                    effectiveRole = 'business';
                }
            }

            toast.success("Bienvenido de nuevo");

            if (effectiveRole === 'business') {
                console.log('Redirecting to Business Dashboard');
                navigate("/business/dashboard");
            } else if (effectiveRole === 'admin' || effectiveRole === 'super_admin') {
                console.log('Redirecting to Admin Dashboard');
                navigate("/");
            } else {
                console.log('Redirecting to Default (Admin) Dashboard - Role:', effectiveRole);
                // Optional: Deny access to other roles if needed
                navigate("/");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Velozia Admin
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Panel de control administrativo
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Iniciar Sesión</CardTitle>
                        <CardDescription>
                            Ingresa tus credenciales para acceder
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@velozia.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    "Ingresar"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
