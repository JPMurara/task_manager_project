CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hash_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    CONSTRAINT unique_team_name UNIQUE (team_name)
);

CREATE TABLE IF NOT EXISTS members (
    member_id SERIAL PRIMARY Key,
    is_leader BOOLEAN,
    user_id INTEGER REFERENCES users(user_id),
    team_id INTEGER REFERENCES teams(team_id),
    CONSTRAINT unique_user_team_combination UNIQUE (user_id, team_id)
);

CREATE TABLE IF NOT EXISTS activities (
    activity_id SERIAL PRIMARY KEY,
    activity_name VARCHAR(255) UNIQUE NOT NULL,
    team_id INTEGER REFERENCES teams(team_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DO and END define the code block (function) in postgres that creates the enumerated types if they dont already exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
        CREATE TYPE priority AS ENUM ('low', 'medium', 'high');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(activity_id),
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    tasks_status task_status,
    task_priority priority,
    assigned_to INTEGER REFERENCES users(user_id),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT unique_task_name_per_activity UNIQUE (activity_id, task_name)
);