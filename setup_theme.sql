-- Platform Settings Table for Dynamic Theme
create table if not exists platform_settings (
    id text primary key,
    settings jsonb not null,
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table platform_settings enable row level security;

-- Policies
create policy "Public read access for platform settings"
  on platform_settings for select
  using (true);

create policy "Admin only update for platform settings"
  on platform_settings for all
  using (
    exists (
      select 1 from user_tiers
      where user_tiers.coach_id = auth.uid()
      and user_tiers.tier_id = 'admin'
    )
  )
  with check (
    exists (
      select 1 from user_tiers
      where user_tiers.coach_id = auth.uid()
      and user_tiers.tier_id = 'admin'
    )
  );

-- Initial default theme
insert into platform_settings (id, settings)
values ('theme', '{
    "accent_cyan": "#06d6a0",
    "accent_teal": "#00b4d8",
    "accent_blue": "#4361ee",
    "accent_violet": "#7b2ff7",
    "accent_pink": "#f72585",
    "bg_primary": "#06080f",
    "bg_secondary": "#0c1019",
    "font_heading": "Outfit",
    "font_body": "Inter"
}'::jsonb)
on conflict (id) do nothing;
