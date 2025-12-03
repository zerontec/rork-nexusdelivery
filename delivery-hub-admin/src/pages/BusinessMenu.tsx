import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BusinessMenu() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [businessId, setBusinessId] = useState<string | null>(null);

    // Form state
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        is_available: true
    });

    useEffect(() => {
        fetchBusinessAndProducts();
    }, []);

    const fetchBusinessAndProducts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get business for current user
            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (business) {
                setBusinessId(business.id);
                fetchProducts(business.id);
            }
        } catch (error) {
            console.error("Error fetching business:", error);
        }
    };

    const fetchProducts = async (busId: string) => {
        try {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', busId)
                .order('category', { ascending: true });

            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!businessId) return;
        if (!formData.name || !formData.price || !formData.category) {
            toast.error("Por favor completa los campos requeridos");
            return;
        }

        try {
            const productData = {
                business_id: businessId,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                image: formData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default placeholder
                is_available: formData.is_available
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                toast.success("Producto actualizado");
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert(productData);

                if (error) throw error;
                toast.success("Producto creado");
            }

            setIsSheetOpen(false);
            fetchProducts(businessId);
            resetForm();
        } catch (error: any) {
            toast.error("Error al guardar: " + error.message);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Producto eliminado");
            setProducts(products.filter(p => p.id !== id));
        } catch (error: any) {
            toast.error("Error al eliminar: " + error.message);
        }
    };

    const handleToggleAvailability = async (product: any) => {
        try {
            const newValue = !product.is_available;
            // Optimistic update
            setProducts(products.map(p => p.id === product.id ? { ...p, is_available: newValue } : p));

            const { error } = await supabase
                .from('products')
                .update({ is_available: newValue })
                .eq('id', product.id);

            if (error) throw error;
        } catch (error) {
            toast.error("Error al actualizar estado");
            fetchProducts(businessId!); // Revert on error
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            image: "",
            is_available: true
        });
    };

    const openEditSheet = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            category: product.category,
            image: product.image,
            is_available: product.is_available
        });
        setIsSheetOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Menú</h1>
                    <p className="text-muted-foreground">Gestiona tus productos y disponibilidad</p>
                </div>
                <Sheet open={isSheetOpen} onOpenChange={(open) => {
                    setIsSheetOpen(open);
                    if (!open) resetForm();
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</SheetTitle>
                            <SheetDescription>
                                Completa los detalles del producto para tu menú.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Hamburguesa Doble"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Precio ($) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={val => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hamburguesas">Hamburguesas</SelectItem>
                                        <SelectItem value="pizzas">Pizzas</SelectItem>
                                        <SelectItem value="bebidas">Bebidas</SelectItem>
                                        <SelectItem value="postres">Postres</SelectItem>
                                        <SelectItem value="otros">Otros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ingredientes, detalles..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Imagen del Producto</Label>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                id="image-url"
                                                value={formData.image}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;

                                                        try {
                                                            const fileExt = file.name.split('.').pop();
                                                            const fileName = `${businessId}/${Date.now()}.${fileExt}`;

                                                            // Upload to Supabase Storage
                                                            const { error: uploadError } = await supabase.storage
                                                                .from('products')
                                                                .upload(fileName, file);

                                                            if (uploadError) throw uploadError;

                                                            // Get Public URL
                                                            const { data: { publicUrl } } = supabase.storage
                                                                .from('products')
                                                                .getPublicUrl(fileName);

                                                            setFormData(prev => ({ ...prev, image: publicUrl }));
                                                            toast.success("Imagen subida correctamente");
                                                        } catch (error: any) {
                                                            console.error('Upload error:', error);
                                                            toast.error("Error al subir imagen: " + error.message);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => document.getElementById('file-upload')?.click()}
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                    Subir
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Sube una imagen desde tu PC o pega una URL externa.
                                        </p>
                                    </div>
                                    {formData.image && (
                                        <div className="h-20 w-20 rounded-md overflow-hidden border bg-gray-50 shrink-0">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>Disponible</Label>
                                    <div className="text-sm text-muted-foreground">
                                        ¿El producto está visible para los clientes?
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.is_available}
                                    onCheckedChange={checked => setFormData({ ...formData, is_available: checked })}
                                />
                            </div>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </SheetClose>
                            <Button onClick={handleSaveProduct}>Guardar</Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border w-full md:w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Imagen</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Cargando menú...</TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No se encontraron productos. ¡Agrega el primero!
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-full w-full p-2 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div>{product.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={product.is_available}
                                            onCheckedChange={() => handleToggleAvailability(product)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditSheet(product)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
