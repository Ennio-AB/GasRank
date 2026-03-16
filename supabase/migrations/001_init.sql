-- Stations (bombas de gasolina)
CREATE TABLE stations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  brand      text,                     -- Esso, Shell, Puma, Maxim, etc.
  address    text,
  lat        double precision NOT NULL,
  lng        double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES stations(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating     int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz DEFAULT now()
);

-- Price reports
CREATE TABLE prices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES stations(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  fuel_type  text NOT NULL,            -- regular, premium, gasoil_opt, gasoil_reg
  price      decimal(8, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Photos
CREATE TABLE photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES stations(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url        text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- View: average rating per station
CREATE VIEW station_ratings AS
  SELECT station_id, ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS total
  FROM reviews
  GROUP BY station_id;
