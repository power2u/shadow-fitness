-- ═══════════════════════════════════════════════════════
-- ShadowFitness — Admin Panel Database Setup
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. Create tier_pricing table for dynamic tier limits
CREATE TABLE IF NOT EXISTS public.tier_pricing (
    id VARCHAR PRIMARY KEY, -- 'free', 'pro', 'clinic', 'admin'
    label VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    max_clients INTEGER NOT NULL,
    workout_plans_per_month INTEGER NOT NULL,
    meal_plans_per_month INTEGER NOT NULL,
    ingredient_selector BOOLEAN NOT NULL DEFAULT false,
    pdf_upload BOOLEAN NOT NULL DEFAULT false,
    max_pdf_books INTEGER NOT NULL DEFAULT 0,
    drug_nutrient_level VARCHAR NOT NULL DEFAULT 'basic',
    export_enabled BOOLEAN NOT NULL DEFAULT false,
    team_seats INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS but allow anyone to read tiers, admins to update. 
-- For simplicity, we just allow public read/write if you don't use strict RLS, 
-- but normally you'd secure the write access.
ALTER TABLE public.tier_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read tier_pricing" ON public.tier_pricing FOR SELECT USING (true);
CREATE POLICY "Allow update tier_pricing" ON public.tier_pricing FOR UPDATE USING (true);
CREATE POLICY "Allow insert tier_pricing" ON public.tier_pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete tier_pricing" ON public.tier_pricing FOR DELETE USING (true);


-- 2. Insert default dynamic pricing tiers
INSERT INTO public.tier_pricing (id, label, color, max_clients, workout_plans_per_month, meal_plans_per_month, ingredient_selector, pdf_upload, max_pdf_books, drug_nutrient_level, export_enabled, team_seats)
VALUES 
('free', 'Free', '#888', 3, 5, 5, false, false, 0, 'basic', false, 1),
('pro', 'Pro', '#06d6a0', 50, 100, 100, true, true, 5, 'full', true, 1),
('clinic', 'Clinic', '#7b2ff7', 999999, 999999, 999999, true, true, 20, 'full', true, 5),
('admin', 'Admin', '#ff2a5f', 999999, 999999, 999999, true, true, 999999, 'full', true, 999999)
ON CONFLICT (id) DO NOTHING;


-- 3. Create user_tiers table mapping auth.users to a tier
CREATE TABLE IF NOT EXISTS public.user_tiers (
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tier_id VARCHAR REFERENCES public.tier_pricing(id) ON DELETE RESTRICT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;
-- Again, for rapid MVP development we allow all operations.
CREATE POLICY "Allow public read user_tiers" ON public.user_tiers FOR SELECT USING (true);
CREATE POLICY "Allow update user_tiers" ON public.user_tiers FOR UPDATE USING (true);
CREATE POLICY "Allow insert user_tiers" ON public.user_tiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete user_tiers" ON public.user_tiers FOR DELETE USING (true);

-- 4. Set up Trigger to auto-create user_tiers entry on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user_tier()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_tiers (coach_id, tier_id)
  VALUES (new.id, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user_tiers
DROP TRIGGER IF EXISTS on_auth_user_created_tier ON auth.users;
CREATE TRIGGER on_auth_user_created_tier
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_tier();
