CREATE TABLE person (
    person_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    registration_date TIMESTAMP NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(500) NOT NULL,
    avatar_hash VARCHAR(100),
    avatar_type VARCHAR(100),
    is_activated BOOLEAN NOT NULL,
    activation_link VARCHAR(100) NOT NULL,
    reset_password_link VARCHAR(100)
);

CREATE TABLE refresh_sessions (
    token_id SERIAL PRIMARY KEY,
    refresh_token VARCHAR(400) NOT NULL,
    finger_print VARCHAR(32) NOT NULL,
    person_fk INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE
);
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    application_date TIMESTAMP NOT NULL,
    content TEXT NOT NULL,
    title VARCHAR(1000) NOT NULL, 
    user_agent JSONB NOT NULL,  
    person_fk INTEGER REFERENCES person(person_id) ON DELETE SET NULL
);

CREATE TABLE feedback_response (
    feedback_response_id SERIAL PRIMARY KEY,
    response_date TIMESTAMP NOT NULL,
    title VARCHAR(1000) NOT NULL, 
    content TEXT NOT NULL,
    feedback_fk INTEGER NOT NULL REFERENCES feedback(feedback_id) ON DELETE SET NULL,
    person_fk INTEGER NOT NULL REFERENCES person(person_id) ON DELETE SET NULL
);

CREATE TABLE journal (
    journal_id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(2) NOT NULL,
    icon_link VARCHAR(150) NOT NULL,
    person_fk INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE
);

CREATE TABLE tag (
    tag_id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    journal_fk INTEGER REFERENCES journal(journal_id) ON DELETE CASCADE,
    person_fk INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE
);
CREATE TABLE note (
    note_id SERIAL PRIMARY KEY,
    title VARCHAR(1000) NOT NULL,
    content TEXT NOT NULL,
    create_date TIMESTAMP NOT NULL,
    update_date TIMESTAMP,
    person_fk INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    journal_fk INTEGER NOT NULL REFERENCES journal(journal_id) ON DELETE CASCADE 
);
CREATE TABLE note_tag (
    note_tag_id SERIAL PRIMARY KEY,
    note_fk INTEGER NOT NULL REFERENCES note(note_id) ON DELETE CASCADE,
    tag_fk INTEGER NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE
);

CREATE TABLE file (
    file_id SERIAL PRIMARY KEY,
    type VARCHAR(30),
    name VARCHAR(100) NOT NULL,
    hash VARCHAR(150) NOT NULL,
    note_fk INTEGER NOT NULL REFERENCES note(note_id) ON DELETE CASCADE
);