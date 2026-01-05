-- Create enum types
CREATE TYPE public.user_role AS ENUM ('donor', 'requester', 'admin');
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Cities table
CREATE TABLE public.cities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    city_id UUID REFERENCES public.cities(id),
    role public.user_role NOT NULL DEFAULT 'donor',
    blood_type public.blood_type,
    nni TEXT,
    is_available BOOLEAN DEFAULT true,
    cooldown_end_date TIMESTAMP WITH TIME ZONE,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table for admin management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.user_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Donation requests table
CREATE TABLE public.donation_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.request_status NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_ar TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_request_id UUID REFERENCES public.donation_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact messages table
CREATE TABLE public.contact_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Cities policies (public read)
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Donors are viewable by requesters" ON public.profiles FOR SELECT USING (
    role = 'donor' AND is_blocked = false
);

-- User roles policies  
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for admin check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Donation requests policies
CREATE POLICY "Users can view their own requests" ON public.donation_requests FOR SELECT 
    USING (
        requester_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR donor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );
CREATE POLICY "Requesters can create requests" ON public.donation_requests FOR INSERT 
    WITH CHECK (requester_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Donors can update request status" ON public.donation_requests FOR UPDATE 
    USING (donor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all requests" ON public.donation_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT 
    USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE 
    USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Contact messages policies
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_requests;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donation_requests_updated_at BEFORE UPDATE ON public.donation_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, phone, email, role, blood_type, nni, city_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'donor'),
        (NEW.raw_user_meta_data ->> 'blood_type')::public.blood_type,
        NEW.raw_user_meta_data ->> 'nni',
        (NEW.raw_user_meta_data ->> 'city_id')::UUID
    );
    
    -- Also add to user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'donor'));
    
    RETURN NEW;
END;
$$;

-- Trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default cities
INSERT INTO public.cities (name_en, name_ar) VALUES
    ('Nouakchott', 'نواكشوط'),
    ('Nouadhibou', 'نواذيبو'),
    ('Rosso', 'روصو'),
    ('Kaédi', 'كيهيدي'),
    ('Zouérat', 'الزويرات'),
    ('Atar', 'أطار'),
    ('Kiffa', 'كيفا'),
    ('Néma', 'النعمة'),
    ('Aioun El Atrouss', 'العيون'),
    ('Sélibaby', 'سيليبابي');