-- Execute this in your Supabase SQL Editor

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    university TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow anon read and insert for the sake of this prototype)
CREATE POLICY "Allow public read access"
ON public.programs
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public insert access"
ON public.programs
FOR INSERT
TO anon
WITH CHECK (true);
