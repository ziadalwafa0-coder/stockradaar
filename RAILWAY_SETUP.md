# StockPulse Backend — Railway Ready

## Railway settings

- Root Directory: leave empty
- Build Command: `npm ci`
- Start Command: `node server.js`

The repository already includes:
- `Procfile`
- `railway.json`
- a corrected `package.json`

## Environment variables

Add these in Railway → Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `FRONTEND_URL`
- `DEFAULT_USER_ID` (optional)

Do not manually set `PORT`; Railway provides it automatically.

## Health check

After deployment:

`https://YOUR-DOMAIN.up.railway.app/api/health`
