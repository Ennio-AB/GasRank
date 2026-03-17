-- Profiles
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_read"   ON profiles FOR SELECT USING (true);
CREATE POLICY "own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Feed: tabla para facturas subidas
CREATE TABLE receipts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES stations(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url  text NOT NULL,
  fuel_type  text,
  price      decimal(8,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_read_rec"  ON receipts FOR SELECT USING (true);
CREATE POLICY "own_insert_rec" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete_rec" ON receipts FOR DELETE USING (auth.uid() = user_id);
