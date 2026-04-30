-- Supabase Database Initialization Script
-- You can copy and paste this into your Supabase SQL Editor when you are ready to use the cloud database.

-- Create a table for storing scraped programs
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    requirements JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS) policies
-- Allow everyone to read programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.programs
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert programs
CREATE POLICY "Allow authenticated insert"
ON public.programs
FOR INSERT
TO authenticated
WITH CHECK (true);
