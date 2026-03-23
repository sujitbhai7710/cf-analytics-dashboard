# CF Analytics Dashboard

A comprehensive analytics dashboard for Cloudflare Workers and Pages built with SvelteKit.

## Features

- 📊 **Traffic Analytics** - Monitor requests, errors, and response times
- 🤖 **Bot Detection** - Identify bots, scrapers, and suspicious traffic
- 🌍 **Geographic Insights** - See traffic by country
- ⚡ **Cache Performance** - Track cache hit rates
- 🔐 **Secure** - AES-256-GCM encryption for API tokens

## Tech Stack

- **Frontend + Backend**: SvelteKit with `@sveltejs/adapter-cloudflare`
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Cache**: Cloudflare KV
- **Encryption**: AES-256-GCM via Web Crypto API
- **Analytics**: Cloudflare GraphQL Analytics API

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create D1 Database

```bash
wrangler d1 create cf-analytics-db
```

Update `wrangler.toml` with your database ID.

### 3. Create KV Namespace

```bash
wrangler kv:namespace create KV
```

Update `wrangler.toml` with your KV namespace ID.

### 4. Set secrets

```bash
# Generate a 32-byte encryption key
openssl rand -base64 32

# Set secrets
wrangler secret put ENCRYPTION_KEY
wrangler secret put JWT_SECRET
```

### 5. Run migrations

```bash
wrangler d1 execute cf-analytics-db --file=./migrations/0001_initial.sql
```

### 6. Run locally

```bash
npm run dev
```

### 7. Deploy

```bash
npm run build
wrangler pages deploy .svelte-kit/cloudflare --project-name=cf-analytics-dashboard
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ENCRYPTION_KEY` | Base64-encoded 32-byte key for AES-256-GCM encryption |
| `JWT_SECRET` | Secret key for JWT token signing |
| `PREVIOUS_ENCRYPTION_KEY` | Optional previous key for key rotation |

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── auth/          # JWT and password hashing
│   │   ├── encryption/    # AES-256-GCM encryption
│   │   ├── cloudflare/    # GraphQL API client
│   │   ├── analytics/     # Bot detection
│   │   └── db/            # Database utilities
│   └── components/        # UI components
├── routes/
│   ├── api/               # API endpoints
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # Main dashboard
│   ├── accounts/          # Cloudflare accounts management
│   ├── analytics/         # Detailed analytics
│   └── settings/          # User settings
└── app.html               # HTML template
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/accounts` | GET, POST | List/add Cloudflare accounts |
| `/api/analytics/overview` | GET | Get analytics overview |

## License

MIT
