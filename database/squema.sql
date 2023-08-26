CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hash_password TEXT NOT NULL,
);

CREATE TABLE IF NOT EXISTS teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
);

CREATE TABLE IF NOT EXISTS members (
    member_id SERIAL PRIMARY Key,
    is_leader BOOLEAN,
    user_id INTEGER REFERENCES users(user_id),
    team_id INTEGER REFERENCES teams(team_id)
);


CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(20) NOT NULL,
    task_description TEXT,
    tasks_status task_status NOT NULL,
    assigned_to INTEGER REFERENCES users(user_id),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    team_id INTEGER REFERENCES teams(team_id)
);