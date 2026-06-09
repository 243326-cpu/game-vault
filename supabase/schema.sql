create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id text primary key,
  name text not null,
  game text not null,
  spots integer not null,
  status text not null default 'Open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gamertag text not null unique,
  game text not null,
  tournament_id text references public.tournaments(id),
  payment_method text not null default 'USDT',
  payment_status text not null default 'Paid',
  registration_fee numeric not null default 500,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  game text not null,
  rank text not null,
  score integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id text primary key,
  name text not null,
  game text not null,
  captain text not null,
  members text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.tournaments (id, name, game, spots, status)
values
  ('t1', 'GameVault Summer Cup', 'Valorant', 10, 'Open'),
  ('t2', 'Champions Clash', 'PUBG', 16, 'Open')
on conflict (id) do update set
  name = excluded.name,
  game = excluded.game,
  spots = excluded.spots,
  status = excluded.status,
  updated_at = now();

insert into public.teams (id, name, game, captain, members)
values
  ('team1', 'Blue Falcons', 'Valorant', 'ShadowPro', array['ShadowPro', 'DiamondQueen', 'LunarShade']),
  ('team2', 'Red Hawks', 'PUBG', 'NinjaX', array['NinjaX', 'RogueSniper']),
  ('team3', 'Cyber Knights', 'Apex Legends', 'Frostbite', array['Frostbite', 'CyberFrost'])
on conflict (id) do update set
  name = excluded.name,
  game = excluded.game,
  captain = excluded.captain,
  members = excluded.members,
  updated_at = now();

insert into public.players (name, game, rank, score)
values
  ('ShadowPro', 'Valorant', 'Diamond', 2500),
  ('NinjaX', 'PUBG', 'Ace', 3200),
  ('Blaze', 'Fortnite', 'Elite', 2800),
  ('NovaRift', 'League of Legends', 'Challenger', 3400),
  ('CyberFrost', 'Apex Legends', 'Master', 2950),
  ('DiamondQueen', 'Valorant', 'Diamond', 4100),
  ('Spellbound', 'League of Legends', 'Platinum', 2300),
  ('RogueSniper', 'PUBG', 'Gold', 1900),
  ('Frostbite', 'Apex Legends', 'Diamond', 3750),
  ('StarBlitz', 'Fortnite', 'Master', 3600),
  ('LunarShade', 'Valorant', 'Platinum', 2150),
  ('PhoenixFire', 'Overwatch 2', 'Grandmaster', 3850),
  ('VoidWalker', 'Rocket League', 'Diamond', 3050),
  ('Lightning', 'Call of Duty', 'Master', 3300),
  ('ArcanePulse', 'League of Legends', 'Diamond', 2980);

insert into public.registrations (
  name,
  gamertag,
  game,
  tournament_id,
  payment_method,
  payment_status,
  registration_fee,
  registered_at,
  updated_at
)
values
  ('Ayaan Malik', 'ShadowPro', 'Valorant', 't1', 'USDT', 'Paid', 500, '2026-06-08 22:20:00+05', now()),
  ('Sara Khan', 'DiamondQueen', 'Valorant', 't1', 'JazzCash', 'Paid', 500, '2026-06-08 22:24:00+05', now()),
  ('Hamza Ali', 'NinjaX', 'PUBG', 't2', 'EasyPaisa', 'Pending', 500, '2026-06-08 22:30:00+05', now())
on conflict (gamertag) do update set
  name = excluded.name,
  game = excluded.game,
  tournament_id = excluded.tournament_id,
  payment_method = excluded.payment_method,
  payment_status = excluded.payment_status,
  registration_fee = excluded.registration_fee,
  updated_at = now();
