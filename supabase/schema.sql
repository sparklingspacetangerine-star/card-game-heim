-- Arcana D&D campaign backend. Run in Supabase SQL editor.
create type public.user_role as enum ('player','master');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Игрок',
  role public.user_role not null default 'player',
  daily_pulls integer not null default 5 check (daily_pulls between 0 and 5),
  pulls_reset_at timestamptz not null default (now() + interval '24 hours'),
  gift_boosters integer not null default 0 check (gift_boosters >= 0),
  created_at timestamptz not null default now()
);
create table public.collections (user_id uuid references public.profiles(id) on delete cascade, card_id text not null, copies integer not null default 0 check (copies >= 0), primary key(user_id,card_id));
create table public.pity_state (user_id uuid primary key references public.profiles(id) on delete cascade, gold_misses integer not null default 0, diamond_misses integer not null default 0, ruby_misses integer not null default 0);
create table public.gift_log (id uuid primary key default gen_random_uuid(), master_id uuid not null references public.profiles(id), player_id uuid not null references public.profiles(id), reward_type text not null check (reward_type in ('card','booster')), card_id text, quantity integer not null check (quantity > 0), created_at timestamptz not null default now());
create or replace function public.is_master() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='master') $$;
alter table public.profiles enable row level security; alter table public.collections enable row level security; alter table public.pity_state enable row level security; alter table public.gift_log enable row level security;
create policy "profiles own or master" on public.profiles for select using (id=auth.uid() or public.is_master());
create policy "collections own or master" on public.collections for select using (user_id=auth.uid() or public.is_master());
create policy "pity own" on public.pity_state for select using (user_id=auth.uid());
create policy "gift own or master" on public.gift_log for select using (player_id=auth.uid() or master_id=auth.uid() or public.is_master());
-- The client must call server-side RPCs; clients cannot update balances or collections directly.
create or replace function public.claim_daily_pulls() returns public.profiles language plpgsql security definer set search_path=public as $$ declare p public.profiles; begin select * into p from public.profiles where id=auth.uid() for update; if p.pulls_reset_at <= now() then update public.profiles set daily_pulls=5,pulls_reset_at=now()+interval '24 hours' where id=auth.uid() returning * into p; end if; return p; end; $$;
revoke all on function public.claim_daily_pulls() from public; grant execute on function public.claim_daily_pulls() to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,username) values(new.id,coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1))); insert into public.pity_state(user_id) values(new.id); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.consume_daily_pulls(amount integer) returns public.profiles language plpgsql security definer set search_path=public as $$ declare p public.profiles; begin if amount not between 1 and 5 then raise exception 'invalid pull amount'; end if; select * into p from public.profiles where id=auth.uid() for update; if p is null then raise exception 'profile not found'; end if; if p.pulls_reset_at <= now() then update public.profiles set daily_pulls=5,pulls_reset_at=now()+interval '24 hours' where id=auth.uid() returning * into p; end if; if p.daily_pulls < amount then raise exception 'not enough daily pulls'; end if; update public.profiles set daily_pulls=daily_pulls-amount where id=auth.uid() returning * into p; return p; end; $$;
revoke all on function public.consume_daily_pulls(integer) from public; grant execute on function public.consume_daily_pulls(integer) to authenticated;
