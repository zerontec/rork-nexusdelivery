-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Allow service role (or triggers) to insert
-- (Implicitly allowed for service role, but for client-side inserts if needed:)
-- CREATE POLICY "Users can insert notifications" ... (Usually we don't want users to insert their own notifications unless it's a specific use case)

-- Create a function to handle new order notifications for business owners
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
    business_name TEXT;
BEGIN
    -- Get the owner_id of the business
    SELECT owner_id, name INTO owner_id, business_name
    FROM public.businesses
    WHERE id = NEW.business_id;

    IF owner_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            owner_id,
            'Nuevo Pedido #' || SUBSTRING(NEW.id::text, 1, 8),
            'Has recibido un nuevo pedido por $' || NEW.total,
            'success',
            '/business/orders'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new orders
DROP TRIGGER IF EXISTS on_new_order_notification ON public.orders;
CREATE TRIGGER on_new_order_notification
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_order_notification();

-- Create a function to handle new driver registration notifications for admins
-- (Assuming admins are identified by role 'admin' in profiles)
CREATE OR REPLACE FUNCTION public.handle_new_driver_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Notify all admins (this might be expensive if many admins, but usually few)
    -- For now, let's just pick one or iterate. Or maybe we don't notify specific admin but have a system notification.
    -- Better: Insert for all users with role 'admin'
    
    FOR admin_id IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            admin_id,
            'Nuevo Repartidor Registrado',
            'El repartidor ' || NEW.name || ' se ha registrado y espera aprobación.',
            'info',
            '/usuarios?tab=repartidores'
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new drivers
DROP TRIGGER IF EXISTS on_new_driver_notification ON public.drivers;
CREATE TRIGGER on_new_driver_notification
AFTER INSERT ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_driver_notification();
