# ⛽ GasRank

Red social para reportar y consultar precios de gasolina en República Dominicana. Los usuarios pueden encontrar bombas cercanas, reportar precios, subir facturas y dejar reseñas verificadas.

---

## Capturas de pantalla

| Mapa | Detalle | Buscar | Cuenta |
|------|---------|--------|--------|
| Mapa interactivo con marcadores de precio | Mini mapa + precios + reseñas | Búsqueda local y OpenStreetMap | Perfil estilo settings |

---

## Características

- **Mapa interactivo** — estaciones de gasolina con rating flotante, buscador integrado y card de detalle al tocar
- **Precios en tiempo real** — cualquier usuario puede reportar el precio por tipo de combustible (Regular, Premium, Gasoil Óptimo, Gasoil Regular)
- **Reseñas verificadas** — solo usuarios que suban su factura de compra pueden dejar una reseña, evitando bots y reviews falsas
- **OpenStreetMap** — busca gasolineras reales del mundo y regístralas en la app con un clic
- **Una reseña por estación** — constraint único en base de datos: 1 review por usuario por estación
- **Perfil de usuario** — autenticación completa con Supabase Auth
- **Logs en tiempo real** — pantalla de diagnóstico para monitorear errores

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | [Expo](https://expo.dev) + [React Native](https://reactnative.dev) |
| Router | [Expo Router](https://expo.github.io/router) v6 (file-based) |
| Backend | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Estado global | [Zustand](https://zustand-demo.pmnd.rs) |
| Mapas | [react-native-maps](https://github.com/react-native-maps/react-native-maps) |
| Ubicación | [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) |
| Íconos | [@expo/vector-icons](https://icons.expo.fyi) (Ionicons) |
| Datos externos | [OpenStreetMap Overpass API](https://overpass-api.de) |

---

## Estructura del proyecto

```
GasRank/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Mapa principal
│   │   ├── feed.tsx         # Feed social
│   │   ├── search.tsx       # Búsqueda + OpenStreetMap
│   │   ├── profile.tsx      # Cuenta / perfil
│   │   └── logs.tsx         # Logs de diagnóstico
│   ├── auth/
│   │   └── login.tsx        # Login / registro
│   └── station/
│       ├── [id].tsx         # Detalle de estación
│       └── new.tsx          # Agregar nueva estación
├── components/
│   ├── MapPin/              # Marcador del mapa
│   ├── StationCard/         # Tarjeta de estación
│   ├── PriceReport/         # Reportar precios
│   ├── ReceiptUpload/       # Subir factura
│   └── ReviewForm/          # Reseñas verificadas
├── store/
│   ├── auth.ts              # Estado de autenticación
│   ├── stations.ts          # Estado de estaciones
│   └── profile.ts           # Estado del perfil
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   ├── logger.ts            # Logger persistente
│   └── osm.ts               # OpenStreetMap Overpass API
└── supabase/
    └── migrations/          # Migraciones SQL
```

---

## Configuración

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/gasrank.git
cd gasrank
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Obtén estas keys en: **Supabase Dashboard → Settings → API**

### 3. Base de datos

Ejecuta las migraciones en orden desde el SQL Editor de Supabase o con la CLI:

```bash
npx supabase link --project-ref tu-project-ref
npx supabase db push
```

### 4. Storage

Crea un bucket llamado `photos` en **Supabase Dashboard → Storage** con acceso público.

### 5. Correr la app

```bash
npx expo start
```

Escanea el QR con **Expo Go** (iOS/Android) o presiona `w` para abrir en navegador.

---

## Base de datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `stations` | Estaciones de gasolina (nombre, marca, coordenadas) |
| `prices` | Precios reportados por tipo de combustible |
| `reviews` | Reseñas (1 por usuario por estación, requiere factura) |
| `photos` | Facturas y fotos subidas por usuarios |
| `profiles` | Perfil público del usuario |

### Vista

| Vista | Descripción |
|-------|-------------|
| `station_ratings` | Rating promedio y total de reseñas por estación |

### Reglas de negocio en DB

- **RLS activado** en todas las tablas (lectura pública, escritura autenticada)
- **Trigger `require_receipt_for_review`** — bloquea reviews sin factura previa
- **UNIQUE(station_id, user_id)** en reviews — máximo 1 reseña por usuario por estación

---

## Seguridad anti-bots

Para dejar una reseña el usuario debe:
1. Estar autenticado
2. Haber subido al menos una foto de factura de esa estación

Esto está reforzado tanto en el frontend (UI oculta) como en el backend (trigger de PostgreSQL).

---

## Licencia

MIT © 2026 GasRank
