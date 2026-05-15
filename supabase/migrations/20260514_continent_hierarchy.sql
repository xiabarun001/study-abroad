-- Create continents table
CREATE TABLE public.continents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create countries table
CREATE TABLE public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    continent_id UUID REFERENCES public.continents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add country_id to universities
ALTER TABLE public.universities
ADD COLUMN country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;

-- Insert initial continents
INSERT INTO public.continents (name, slug, cover_image) VALUES
('北美洲', 'north-america', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800'),
('欧洲', 'europe', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800'),
('亚洲', 'asia', 'https://images.unsplash.com/photo-1535139262971-c5184570f04f?auto=format&fit=crop&q=80&w=800'),
('大洋洲', 'oceania', 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800');
