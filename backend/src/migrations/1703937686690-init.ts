export const initMigration = `
  CREATE EXTENSION pg_trgm;

  CREATE TYPE microservice_name_enum AS ENUM ('frontendServer');

  CREATE TABLE microservice_access_tokens (
    id text DEFAULT gen_random_uuid() PRIMARY KEY,
    revoked boolean NOT NULL DEFAULT false,
    microservice_name microservice_name_enum NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );

  CREATE INDEX IND_59f4bf3994409a2f18c7b3744d5eb438 ON microservice_access_tokens (revoked)
  WHERE revoked IS TRUE;

  CREATE TABLE google_auth (
    user_id text NOT NULL PRIMARY KEY,
    email text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT CNS_c18065c157f5927f4d988d3c91a528bf UNIQUE (email)
  );

  CREATE TABLE facebook_login (
    user_id text NOT NULL PRIMARY KEY,
    email text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT CNS_ce33e7fc07058dc79f456caa5c8da25 UNIQUE (email)
  );

  CREATE TABLE users (
    id text DEFAULT gen_random_uuid() PRIMARY KEY,
    email text,
    google_user_id text,
    facebook_user_id text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT CNS_a3b8d9be6ea7b860f13b059909d4851b UNIQUE (email),
    CONSTRAINT CNS_7e545ea70b4fb2f078c0aeb6b64b5bd8 FOREIGN KEY (google_user_id) REFERENCES google_auth(user_id),
    CONSTRAINT CNS_193f2778527aa3bff6f6b1b83ca41db7 UNIQUE (google_user_id),
    CONSTRAINT CNS_a7e3c52e770e922bbb08829aee2f31b74 FOREIGN KEY (facebook_user_id) REFERENCES facebook_login(user_id),
    CONSTRAINT CNS_9b779e0afba335438ffd01a427d0a1dc UNIQUE (facebook_user_id)
  );

  CREATE TABLE auth (
    user_id text PRIMARY KEY,
    password text NOT NULL,
    salt text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT CNS_a3b8d9be6ea7b860f13b059909d4851b FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE access_tokens (
    id text DEFAULT gen_random_uuid() PRIMARY KEY,
    revoked boolean NOT NULL DEFAULT false,
    user_id text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT CNS_94a0683aef1ee41a0fe1a39fd93dbd1d FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IND_f38486c30c9e130a4b18f9700077bf8b ON access_tokens (revoked)
  WHERE revoked IS TRUE;

  CREATE TABLE notes (
    id text DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    text text,
    hidden boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id text NOT NULL,
    CONSTRAINT CNS_457f4fd1b9e7a0ca0d26bbae889e4c80 FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IND_341c9ac6debe4dd0c8a1d5b36c97a14c ON notes USING GIN (title gin_trgm_ops);
`;
