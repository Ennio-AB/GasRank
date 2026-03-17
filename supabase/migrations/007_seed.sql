-- Seed: estaciones de ejemplo
INSERT INTO stations (id, name, brand, address, lat, lng) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Bomba Esso Av. 27',     'Esso',  'Av. 27 de Febrero, Santo Domingo',    18.4861, -69.9312),
  ('11111111-0000-0000-0000-000000000002', 'Shell Zona Colonial',   'Shell', 'Calle El Conde, Santo Domingo',       18.4735, -69.8846),
  ('11111111-0000-0000-0000-000000000003', 'Puma Los Prados',       'Puma',  'Av. Los Próceres, Santo Domingo',     18.5012, -69.9501),
  ('11111111-0000-0000-0000-000000000004', 'Maxim Miramar',         'Maxim', 'Av. Abraham Lincoln, Santo Domingo',  18.4793, -69.9432),
  ('11111111-0000-0000-0000-000000000005', 'Sunix Santiago Centro', 'Sunix', 'Av. Las Carreras, Santiago',          19.4517, -70.6970)
ON CONFLICT (id) DO NOTHING;

-- Seed: reviews de ejemplo usando el usuario existente
INSERT INTO reviews (station_id, user_id, rating, comment) VALUES
  ('11111111-0000-0000-0000-000000000001', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 5, 'Excelente servicio, siempre rápido.'),
  ('11111111-0000-0000-0000-000000000001', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 4, 'Buena bomba, buen precio de regular.'),
  ('11111111-0000-0000-0000-000000000002', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 3, 'La fila es larga los fines de semana.'),
  ('11111111-0000-0000-0000-000000000003', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 5, 'La mejor de la zona, muy limpia.'),
  ('11111111-0000-0000-0000-000000000004', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 2, 'Manguera averiada, tardé mucho.'),
  ('11111111-0000-0000-0000-000000000005', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 4, 'Buena atención, precios correctos.')
ON CONFLICT DO NOTHING;

-- Seed: precios de ejemplo
INSERT INTO prices (station_id, user_id, fuel_type, price) VALUES
  ('11111111-0000-0000-0000-000000000001', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 'Regular',       293.60),
  ('11111111-0000-0000-0000-000000000001', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 'Premium',       312.40),
  ('11111111-0000-0000-0000-000000000001', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 'Gasoil Óptimo', 236.90),
  ('11111111-0000-0000-0000-000000000002', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 'Regular',       293.60),
  ('11111111-0000-0000-0000-000000000003', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 'Premium',       312.40),
  ('11111111-0000-0000-0000-000000000003', 'c60f4331-349f-4e30-8f2d-f59246d0dbc7', 'Gasoil Regular',221.10)
ON CONFLICT DO NOTHING;
