-- Enable vector extension for embeddings
create extension if not exists vector;

-- Create questions table for the parsed exam items
create table questions (
  id uuid default gen_random_uuid() primary key,
  materia text not null, -- e.g., "História do Brasil"
  comando text, -- Context or command for the question
  num_item int not null, -- The item number (e.g., 25)
  texto_item text not null, -- The actual statement to judge (C/E)
  gabarito varchar(1), -- 'C', 'E', or 'X' (Anulado)
  anulado boolean default false, -- Derived from gabarito 'X'
  
  -- Metadata
  examen_ano int default 2025,
  examen_turno text, -- 'Manhã' or 'Tarde'
  
  -- Semantic Search
  embedding vector(768), -- Dimension for Gemini Embedding-001/004. Check exact model dimension.
  
  created_at timestamp with time zone default now()
);

-- Index for semantic search (HNSW for speed)
create index idx_questions_embedding on questions using hnsw (embedding vector_cosine_ops);
