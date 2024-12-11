CREATE TABLE IF NOT EXISTS users(username VARCHAR(255) PRIMARY KEY NOT NULL,
                                 hashed_password VARCHAR(255) NOT NULL,
                                 email VARCHAR(255) UNIQUE NOT NULL,
                                 is_blocked BOOLEAN NOT NULL,
                                 profile_photo VARCHAR(255) UNIQUE,
                                 cover_photo VARCHAR(255) UNIQUE,
                                 about TEXT,
                                 disabled BOOLEAN NOT NULL,
                                 is_admin BOOLEAN,
                                 is_super_admin BOOLEAN );
CREATE TABLE IF NOT EXISTS canvases(id VARCHAR(255) PRIMARY KEY NOT NULL,
                                    username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
                                    name VARCHAR(255) NOT NULL,
                                    is_public BOOLEAN NOT NULL,
                                    create_date INT NOT NULL,
                                    edit_date INT NOT NULL,
                                    likes INT NOT NULL,
                                    CHECK (create_date >= 0 AND edit_date >= 0 AND likes >= 0));
CREATE TABLE IF NOT EXISTS reports(id SERIAL PRIMARY KEY NOT NULL,
                                   date INT NOT NULL,
                                   type VARCHAR(255) NOT NULL,
                                   canvas_id VARCHAR(255) REFERENCES canvases(id) ON DELETE CASCADE,
                                   username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
                                   description TEXT NOT NULL, CHECK (date >= 0));
CREATE TABLE IF NOT EXISTS canvas_editors(canvas_id VARCHAR(255) REFERENCES canvases(id) ON DELETE CASCADE,
                                          username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
                                          PRIMARY KEY (canvas_id, username));
CREATE TABLE IF NOT EXISTS tags(id SERIAL PRIMARY KEY NOT NULL,
                                name VARCHAR(255) NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS tags_of_canvases(canvas_id VARCHAR(255) REFERENCES canvases(id) ON DELETE CASCADE,
                                            tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
                                            PRIMARY KEY (canvas_id, tag_id));
CREATE TABLE IF NOT EXISTS favorite_tags(username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
                                         tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
                                         PRIMARY KEY (username, tag_id));
CREATE TABLE IF NOT EXISTS likes(canvas_id VARCHAR(255) REFERENCES canvases(id) ON DELETE CASCADE,
                                 username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
                                 PRIMARY KEY (canvas_id, username));
CREATE TABLE IF NOT EXISTS admins(username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE PRIMARY KEY);
CREATE TABLE IF NOT EXISTS super_admins(username VARCHAR(255) REFERENCES users(username) ON DELETE RESTRICT PRIMARY KEY);