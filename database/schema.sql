-- Modelo relacional inicial do Pesca GO. PostgreSQL 15+.
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE request_status AS ENUM ('requested', 'proposal', 'confirmed', 'completed', 'cancelled');
CREATE TYPE provider_status AS ENUM ('pending', 'approved', 'suspended');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  role user_role NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  phone VARCHAR(24),
  city VARCHAR(100),
  state CHAR(2) DEFAULT 'RO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE providers (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  status provider_status NOT NULL DEFAULT 'pending',
  professional_name VARCHAR(150),
  description TEXT,
  response_minutes INTEGER,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE rivers (
  id UUID PRIMARY KEY,
  slug VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  best_season VARCHAR(100),
  difficulty VARCHAR(30),
  guide_recommended BOOLEAN DEFAULT true
);

CREATE TABLE fishing_spots (
  id UUID PRIMARY KEY,
  river_id UUID NOT NULL REFERENCES rivers(id),
  name VARCHAR(140) NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL
);

CREATE TABLE species (
  id UUID PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE river_species (
  river_id UUID REFERENCES rivers(id),
  species_id UUID REFERENCES species(id),
  PRIMARY KEY (river_id, species_id)
);

CREATE TABLE services (
  id UUID PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id),
  title VARCHAR(140) NOT NULL,
  category VARCHAR(40) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  pricing_unit VARCHAR(30) NOT NULL DEFAULT 'day',
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE boats (
  id UUID PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id),
  name VARCHAR(120) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  motor_hp INTEGER,
  safety_notes TEXT
);

CREATE TABLE availability (
  id UUID PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id),
  available_date DATE NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (provider_id, available_date)
);

CREATE TABLE service_requests (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  river_id UUID NOT NULL REFERENCES rivers(id),
  fishing_spot_id UUID REFERENCES fishing_spots(id),
  service_date DATE NOT NULL,
  people_count INTEGER NOT NULL CHECK (people_count > 0),
  service_type VARCHAR(50) NOT NULL,
  status request_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE proposals (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES service_requests(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  amount NUMERIC(12,2) NOT NULL,
  proposed_start TIME,
  notes TEXT,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  request_id UUID UNIQUE NOT NULL REFERENCES service_requests(id),
  proposal_id UUID UNIQUE NOT NULL REFERENCES proposals(id),
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES service_requests(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  author_id UUID NOT NULL REFERENCES users(id),
  subject_id UUID NOT NULL REFERENCES users(id),
  overall SMALLINT NOT NULL CHECK (overall BETWEEN 1 AND 5),
  safety SMALLINT CHECK (safety BETWEEN 1 AND 5),
  service SMALLINT CHECK (service BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, author_id)
);

CREATE INDEX providers_search_idx ON providers (status, available, rating DESC);
CREATE INDEX requests_client_idx ON service_requests (client_id, status, service_date);
CREATE INDEX requests_provider_idx ON service_requests (provider_id, status, service_date);
CREATE INDEX messages_request_idx ON messages (request_id, created_at);
