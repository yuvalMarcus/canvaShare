CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY NOT NULL,
                                 username VARCHAR(255) NOT NULL,
                                 hashed_password VARCHAR(255) NOT NULL,
                                 email VARCHAR(255) UNIQUE NOT NULL,
                                 is_blocked BOOLEAN NOT NULL,
                                 profile_photo VARCHAR(255),
                                 cover_photo VARCHAR(255),
                                 about TEXT,
                                 disabled BOOLEAN NOT NULL);
CREATE TABLE IF NOT EXISTS paints(id SERIAL PRIMARY KEY NOT NULL,
                                    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    name VARCHAR(255) NOT NULL,
                                    is_public BOOLEAN NOT NULL,
                                    create_date INT NOT NULL,
                                    edit_date INT NOT NULL,
                                    likes INT NOT NULL,
                                    description VARCHAR(255),
                                    photo VARCHAR(255) NOT NULL,
                                    CHECK (create_date >= 0 AND edit_date >= 0 AND likes >= 0));
CREATE TABLE IF NOT EXISTS reports(id SERIAL PRIMARY KEY NOT NULL,
                                   date INT NOT NULL,
                                   type VARCHAR(255) NOT NULL,
                                   paint_id INT REFERENCES paints(id) ON DELETE CASCADE,
                                   user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                   description TEXT NOT NULL, CHECK (date >= 0));
CREATE TABLE IF NOT EXISTS tags(id SERIAL PRIMARY KEY NOT NULL,
                                name VARCHAR(255) NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS tags_of_paints(paint_id INT REFERENCES paints(id) ON DELETE CASCADE,
                                            tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
                                            PRIMARY KEY (paint_id, tag_id));
CREATE TABLE IF NOT EXISTS favorite_tags(user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                         tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
                                         PRIMARY KEY (user_id, tag_id));
CREATE TABLE IF NOT EXISTS likes(id SERIAL,
                                 paint_id INT REFERENCES paints(id) ON DELETE CASCADE,
                                 user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                 PRIMARY KEY (paint_id, user_id));
CREATE TABLE IF NOT EXISTS roles(id SERIAL PRIMARY KEY NOT NULL,
                                name VARCHAR(255) NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS user_roles(id SERIAL,
                                 role_id INT REFERENCES roles(id) ON DELETE CASCADE,
                                 user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                 PRIMARY KEY (role_id, user_id));