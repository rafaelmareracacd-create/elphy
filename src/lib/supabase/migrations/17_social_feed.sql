-- Social Feed Tables

-- 1. Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text, -- Optional image for the post
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Posts
alter table public.posts enable row level security;

-- Posts Policies
create policy "Posts are viewable by everyone." on public.posts
  for select using (true);

create policy "Authenticated users can create posts." on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts." on public.posts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own posts." on public.posts
  for delete using (auth.uid() = user_id);


-- 2. Comments Table
create table if not exists public.feed_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Comments
alter table public.feed_comments enable row level security;

-- Comments Policies
create policy "Comments are viewable by everyone." on public.feed_comments
  for select using (true);

create policy "Authenticated users can create comments." on public.feed_comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments." on public.feed_comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments." on public.feed_comments
  for delete using (auth.uid() = user_id);


-- 3. Likes Table (Join Table)
create table if not exists public.feed_likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- Enable RLS for Likes
alter table public.feed_likes enable row level security;

-- Likes Policies
create policy "Likes are viewable by everyone." on public.feed_likes
  for select using (true);

create policy "Authenticated users can toggle likes." on public.feed_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike." on public.feed_likes
  for delete using (auth.uid() = user_id);


-- 4. Triggers to update counts
-- Update likes_count on posts
create or replace function public.handle_new_like()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_un_like()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count - 1 where id = old.post_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_like_created
  after insert on public.feed_likes
  for each row execute procedure public.handle_new_like();

create trigger on_like_deleted
  after delete on public.feed_likes
  for each row execute procedure public.handle_un_like();


-- Update comments_count on posts
create or replace function public.handle_new_comment()
returns trigger as $$
begin
  update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_delete_comment()
returns trigger as $$
begin
  update public.posts set comments_count = comments_count - 1 where id = old.post_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_comment_created
  after insert on public.feed_comments
  for each row execute procedure public.handle_new_comment();

create trigger on_comment_deleted
  after delete on public.feed_comments
  for each row execute procedure public.handle_delete_comment();
