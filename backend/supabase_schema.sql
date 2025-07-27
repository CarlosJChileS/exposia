CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password text NOT NULL
);

-- Stores the presentations uploaded by each user
CREATE TABLE IF NOT EXISTS presentations (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    pdf_url text NOT NULL,
    uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Individual slides belonging to a presentation
CREATE TABLE IF NOT EXISTS slides (
    id serial PRIMARY KEY,
    presentation_id integer NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    number integer NOT NULL,
    image_url text NOT NULL,
    text text
);

-- Practice or evaluation sessions by a user
CREATE TABLE IF NOT EXISTS sessions (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    presentation_id integer REFERENCES presentations(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Audio recordings attached to a session
CREATE TABLE IF NOT EXISTS audio_records (
    id serial PRIMARY KEY,
    session_id integer NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    file_url text NOT NULL
);

-- Analysis results for a session
CREATE TABLE IF NOT EXISTS analysis_results (
    id serial PRIMARY KEY,
    session_id integer NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    clarity real,
    speed_wpm integer,
    pauses integer,
    sentiment text,
    transcript text,
    ai_feedback text,
    full_analysis jsonb
);

-- Navigation events within a session (slide number and time)
CREATE TABLE IF NOT EXISTS navigation (
    id serial PRIMARY KEY,
    session_id integer NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    slide_number integer NOT NULL,
    time_seconds integer NOT NULL
);
