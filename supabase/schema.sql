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

create or replace function public.master_grant_card(target_user uuid, target_card text, amount integer) returns void language plpgsql security definer set search_path=public as $$ begin if not public.is_master() then raise exception 'master role required'; end if; if amount < 1 or amount > 100 then raise exception 'invalid amount'; end if; insert into public.collections(user_id,card_id,copies) values(target_user,target_card,amount) on conflict(user_id,card_id) do update set copies=public.collections.copies+excluded.copies; insert into public.gift_log(master_id,player_id,reward_type,card_id,quantity) values(auth.uid(),target_user,'card',target_card,amount); end; $$;
create or replace function public.master_grant_boosters(target_user uuid, amount integer) returns void language plpgsql security definer set search_path=public as $$ begin if not public.is_master() then raise exception 'master role required'; end if; if amount < 1 or amount > 100 then raise exception 'invalid amount'; end if; update public.profiles set gift_boosters=gift_boosters+amount where id=target_user; insert into public.gift_log(master_id,player_id,reward_type,quantity) values(auth.uid(),target_user,'booster',amount); end; $$;
create or replace function public.consume_gift_booster() returns public.profiles language plpgsql security definer set search_path=public as $$ declare p public.profiles; begin update public.profiles set gift_boosters=gift_boosters-1 where id=auth.uid() and gift_boosters>0 returning * into p; if p is null then raise exception 'no gift boosters'; end if; return p; end; $$;
revoke all on function public.master_grant_card(uuid,text,integer), public.master_grant_boosters(uuid,integer), public.consume_gift_booster() from public;
grant execute on function public.master_grant_card(uuid,text,integer), public.master_grant_boosters(uuid,integer), public.consume_gift_booster() to authenticated;

create or replace function public.get_my_profile()
returns public.profiles
language sql
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;
revoke all on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;

-- Campaign profile and master panel migration
alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists bonus_spins integer not null default 0 check (bonus_spins >= 0);
create unique index if not exists profiles_nickname_unique on public.profiles (lower(trim(nickname))) where nickname is not null;
create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, kind text not null, title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now());
alter table public.notifications enable row level security;
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications for select using (user_id=auth.uid());
create or replace function public.set_my_nickname(new_nickname text) returns public.profiles language plpgsql security definer set search_path=public as $$ declare n text:=regexp_replace(trim(new_nickname),'\\s+',' ','g'); p public.profiles; begin if n !~ '^[[:alnum:]А-Яа-яЁё _-]{3,24}$' then raise exception 'invalid nickname'; end if; if lower(n) in ('администратор','система','support','official','мастер') then raise exception 'reserved nickname'; end if; update public.profiles set nickname=n, username=n where id=auth.uid() returning * into p; if p is null then raise exception 'profile not found'; end if; return p; exception when unique_violation then raise exception 'nickname already used'; end; $$;
create or replace function public.master_list_players() returns table(id uuid, nickname text, username text, role public.user_role, unique_cards bigint, gift_boosters integer, daily_pulls integer, bonus_spins integer) language sql security definer set search_path=public as $$ select p.id,coalesce(p.nickname,p.username,'Игрок'),p.username,p.role,(select count(*) from public.collections c where c.user_id=p.id and c.copies>0),p.gift_boosters,p.daily_pulls,p.bonus_spins from public.profiles p where public.is_master() order by lower(coalesce(p.nickname,p.username)); $$;
create or replace function public.master_grant_spins(target_user uuid, amount integer) returns void language plpgsql security definer set search_path=public as $$ begin if not public.is_master() then raise exception 'master role required'; end if; if amount<1 or amount>1000 then raise exception 'invalid amount'; end if; update public.profiles set bonus_spins=bonus_spins+amount where id=target_user; insert into public.gift_log(master_id,player_id,reward_type,quantity) values(auth.uid(),target_user,'bonus_spins',amount); insert into public.notifications(user_id,kind,title,body) values(target_user,'reward','Дополнительные крутки','Мастер выдал вам '||amount||' бонусных круток.'); end; $$;
revoke all on function public.set_my_nickname(text),public.master_list_players(),public.master_grant_spins(uuid,integer) from public;
grant execute on function public.set_my_nickname(text),public.master_list_players(),public.master_grant_spins(uuid,integer) to authenticated;

-- Allow bonus-spin rewards in the administrative audit log
alter table public.gift_log drop constraint if exists gift_log_reward_type_check;
alter table public.gift_log add constraint gift_log_reward_type_check check (reward_type in ('card','booster','bonus_spins'));

-- Reward delivery confirmation and recipient notifications
 drop function if exists public.master_grant_card(uuid,text,integer);
create or replace function public.master_grant_card(target_user uuid,target_card text,amount integer) returns jsonb language plpgsql security definer set search_path=public as $$ declare new_total integer; op_id uuid; begin if not public.is_master() then raise exception 'master role required'; end if; if amount<1 or amount>100 then raise exception 'invalid amount'; end if; if not exists(select 1 from public.profiles where id=target_user) then raise exception 'recipient not found'; end if; insert into public.collections(user_id,card_id,copies) values(target_user,target_card,amount) on conflict(user_id,card_id) do update set copies=public.collections.copies+excluded.copies returning copies into new_total; insert into public.gift_log(master_id,player_id,reward_type,card_id,quantity) values(auth.uid(),target_user,'card',target_card,amount) returning id into op_id; insert into public.notifications(user_id,kind,title,body) values(target_user,'reward','Подарок от Мастера!','Вы получили карточку: '||target_card||' (x'||amount||').'); return jsonb_build_object('status','completed','operation_id',op_id,'recipient_id',target_user,'reward_type','card','quantity',amount,'copies_total',new_total); end; $$;
 drop function if exists public.master_grant_boosters(uuid,integer);
create or replace function public.master_grant_boosters(target_user uuid,amount integer) returns jsonb language plpgsql security definer set search_path=public as $$ declare new_total integer; op_id uuid; begin if not public.is_master() then raise exception 'master role required'; end if; if amount<1 or amount>100 then raise exception 'invalid amount'; end if; update public.profiles set gift_boosters=gift_boosters+amount where id=target_user returning gift_boosters into new_total; if not found then raise exception 'recipient not found'; end if; insert into public.gift_log(master_id,player_id,reward_type,quantity) values(auth.uid(),target_user,'booster',amount) returning id into op_id; insert into public.notifications(user_id,kind,title,body) values(target_user,'reward','Подарок от Мастера!', 'Вы получили бустеров: '||amount||'.'); return jsonb_build_object('status','completed','operation_id',op_id,'recipient_id',target_user,'reward_type','booster','quantity',amount,'balance',new_total); end; $$;
 drop function if exists public.master_grant_spins(uuid,integer);
create or replace function public.master_grant_spins(target_user uuid,amount integer) returns jsonb language plpgsql security definer set search_path=public as $$ declare new_total integer; op_id uuid; begin if not public.is_master() then raise exception 'master role required'; end if; if amount<1 or amount>1000 then raise exception 'invalid amount'; end if; update public.profiles set bonus_spins=bonus_spins+amount where id=target_user returning bonus_spins into new_total; if not found then raise exception 'recipient not found'; end if; insert into public.gift_log(master_id,player_id,reward_type,quantity) values(auth.uid(),target_user,'bonus_spins',amount) returning id into op_id; insert into public.notifications(user_id,kind,title,body) values(target_user,'reward','Дополнительные крутки!', 'Вы получили бонусных круток: '||amount||'.'); return jsonb_build_object('status','completed','operation_id',op_id,'recipient_id',target_user,'reward_type','bonus_spins','quantity',amount,'balance',new_total); end; $$;
revoke all on function public.master_grant_card(uuid,text,integer),public.master_grant_boosters(uuid,integer),public.master_grant_spins(uuid,integer) from public;
grant execute on function public.master_grant_card(uuid,text,integer),public.master_grant_boosters(uuid,integer),public.master_grant_spins(uuid,integer) to authenticated;

create or replace function public.get_my_collection()
returns table(card_id text, copies integer)
language sql
security definer
set search_path = public
as $$
  select c.card_id, c.copies
  from public.collections c
  where c.user_id = auth.uid();
$$;
revoke all on function public.get_my_collection() from public;
grant execute on function public.get_my_collection() to authenticated;
