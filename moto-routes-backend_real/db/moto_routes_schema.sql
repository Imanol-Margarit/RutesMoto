-- =====================================================
-- MOTO ROUTES - base de datos completa
-- Solo la estructura de las tablas. Los datos de ejemplo están en src/seeders/seed.js.
-- =====================================================

-- =====================================================
-- MOTO ROUTES - esquema PostgreSQL
-- Convenciones (igual que el ejemplo TicketMaster):
--   id UUID, created_at, updated_at, deleted_at (soft delete),
--   is_active (on/off), status (estado propio), slug (URL amigable).
-- Tablas: roles, users, hosts, categories, locations,
--         rutas, rutas_images, departures
-- =====================================================

-- EXTENSION PARA UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ROLES
-- =====================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
);

CREATE INDEX idx_users_role ON users (role_id);

-- =====================================================
-- HOSTS (guías / organizadores de rutas)
-- Cada host puede estar ligado a un único usuario.
-- =====================================================
CREATE TABLE hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE,

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    biography TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_hosts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- =====================================================
-- CATEGORIES (tipo de ruta: Curvas, Paisaje, Off-road...)
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(60) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- =====================================================
-- LOCATIONS (ciudad, región y país, con coordenadas)
-- =====================================================
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    address VARCHAR(255),
    postal_code VARCHAR(20),

    latitude DECIMAL(9,6) CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(9,6) CHECK (longitude BETWEEN -180 AND 180),

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- =====================================================
-- RUTAS
-- =====================================================
CREATE TABLE rutas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    host_id UUID,
    category_id UUID,
    location_id UUID,

    title VARCHAR(120) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description VARCHAR(500),

    distance_km DECIMAL(6,2) NOT NULL
        CHECK (distance_km >= 0),

    difficulty VARCHAR(20) NOT NULL
        CHECK (difficulty IN ('facil', 'media', 'dificil')),

    surface VARCHAR(20) NOT NULL DEFAULT 'asfalto'
        CHECK (surface IN ('asfalto', 'mixto', 'tierra')),

    start_point VARCHAR(200),

    estimated_minutes INTEGER
        CHECK (estimated_minutes > 0),

    status VARCHAR(20) NOT NULL DEFAULT 'publicada'
        CHECK (status IN ('borrador', 'publicada', 'archivada')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_rutas_host
        FOREIGN KEY (host_id)
        REFERENCES hosts(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_rutas_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_rutas_location
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_rutas_host ON rutas (host_id);
CREATE INDEX idx_rutas_category ON rutas (category_id);
CREATE INDEX idx_rutas_location ON rutas (location_id);

-- =====================================================
-- RUTAS IMAGES
-- Varias imágenes por ruta. Como mucho una principal por ruta.
-- =====================================================
CREATE TABLE rutas_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ruta_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_rutas_images_ruta
        FOREIGN KEY (ruta_id)
        REFERENCES rutas(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_rutas_images_ruta ON rutas_images (ruta_id);

-- Solo una imagen principal por ruta (ignora las borradas).
CREATE UNIQUE INDEX uq_rutas_images_primary
    ON rutas_images (ruta_id)
    WHERE is_primary AND deleted_at IS NULL;

-- =====================================================
-- DEPARTURES (salidas programadas de una ruta)
-- Las fechas van con zona horaria (TIMESTAMPTZ) para no
-- perder el desfase al guardar fechas con +01:00.
-- =====================================================
CREATE TABLE departures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ruta_id UUID NOT NULL,

    slug VARCHAR(200) NOT NULL,

    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,

    capacity INTEGER NOT NULL
        CHECK (capacity > 0),

    booked_participants INTEGER NOT NULL DEFAULT 0
        CHECK (booked_participants >= 0),

    price NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (price >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'full', 'cancelled', 'completed')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT uq_departure_slug
        UNIQUE (ruta_id, slug),

    CONSTRAINT chk_departure_dates
        CHECK (end_datetime > start_datetime),

    CONSTRAINT chk_departure_seats
        CHECK (booked_participants <= capacity),

    CONSTRAINT fk_departures_ruta
        FOREIGN KEY (ruta_id)
        REFERENCES rutas(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_departures_ruta ON departures (ruta_id);
CREATE INDEX idx_departures_start ON departures (start_datetime);

-- =====================================================
-- IMÁGENES DE OTRAS ENTIDADES (misma estructura que rutas_images)
-- =====================================================

CREATE TABLE hosts_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    host_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_hosts_images_hosts
        FOREIGN KEY (host_id)
        REFERENCES hosts(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_hosts_images_hosts ON hosts_images (host_id);

CREATE UNIQUE INDEX uq_hosts_images_primary
    ON hosts_images (host_id)
    WHERE is_primary AND deleted_at IS NULL;

CREATE TABLE categories_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_categories_images_categories
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_categories_images_categories ON categories_images (category_id);

CREATE UNIQUE INDEX uq_categories_images_primary
    ON categories_images (category_id)
    WHERE is_primary AND deleted_at IS NULL;

CREATE TABLE locations_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    location_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_locations_images_locations
        FOREIGN KEY (location_id)
        REFERENCES locations(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_locations_images_locations ON locations_images (location_id);

CREATE UNIQUE INDEX uq_locations_images_primary
    ON locations_images (location_id)
    WHERE is_primary AND deleted_at IS NULL;

CREATE TABLE users_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_users_images_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_users_images_users ON users_images (user_id);

CREATE UNIQUE INDEX uq_users_images_primary
    ON users_images (user_id)
    WHERE is_primary AND deleted_at IS NULL;
