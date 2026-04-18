# 🚀 Mwongozo wa Kuhost App Bure

## Hatua 1: GitHub (Hifadhi Code Yako)

### 1.1 Tengeneza Akaunti
- Nenda: https://github.com
- Bonyeza "Sign up" na tengeneza akaunti bure

### 1.2 Pakia Code GitHub
```bash
# Kwenye terminal, nenda kwenye folder ya project
cd dirham-exchange

# Anzisha git
git init
git add .
git commit -m "🚀 Dirham Exchange Manager v1.0"

# Tengeneza repo mpya GitHub (kwenye website ya GitHub)
# Kisha unganisha:
git remote add origin https://github.com/JINA_LAKO/dirham-exchange.git
git branch -M main
git push -u origin main
```

---

## Hatua 2: HOST BACKEND — Render.com (BURE)

### 2.1 Tengeneza Akaunti Render
- Nenda: https://render.com
- Ingia kwa GitHub account yako

### 2.2 Tengeneza Database ya PostgreSQL
1. Dashboard → "New" → "PostgreSQL"
2. Jaza:
   - Name: `dirham-exchange-db`
   - Plan: **Free**
3. Bonyeza "Create Database"
4. Nakili **"External Database URL"** — utaitumia baadaye

### 2.3 Deploy Backend
1. Dashboard → "New" → "Web Service"
2. Unganisha GitHub repo yako
3. Jaza mipangilio:
   - **Name:** `dirham-exchange-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run db:generate && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Free

4. Bonyeza **"Environment Variables"** → Ongeza:
   ```
   DATABASE_URL = (URL uliyonakili kutoka step 2.2)
   JWT_SECRET = (weka neno lolote gumu, mfano: MySecretKey2026DirhamExchange!)
   NODE_ENV = production
   FRONTEND_URL = https://dirham-exchange.netlify.app
   ```
5. Bonyeza **"Create Web Service"**
6. Subiri dakika 2-5 ijengewe
7. Nakili URL ya backend mfano: `https://dirham-exchange-api.onrender.com`

---

## Hatua 3: HOST FRONTEND — Netlify (BURE)

### 3.1 Tengeneza Akaunti Netlify
- Nenda: https://netlify.com
- Ingia kwa GitHub account yako

### 3.2 Deploy Frontend
1. Dashboard → "Add new site" → "Import an existing project"
2. Chagua GitHub → Chagua repo yako
3. Jaza mipangilio:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/.next`

4. Bonyeza **"Environment variables"** → Ongeza:
   ```
   NEXT_PUBLIC_API_URL = https://dirham-exchange-api.onrender.com/api
   ```
   (Tumia URL ya backend uliyopata step 2.7)

5. Bonyeza **"Deploy site"**
6. Subiri dakika 2-3
7. Utapata URL kama: `https://wonderful-fox-123456.netlify.app`

### 3.3 Badilisha URL ya Netlify
- Nenda Site Settings → Domain Management
- Bonyeza "Options" → "Edit site name"
- Weka jina unalotaka mfano: `dirham-exchange-tz`
- URL itakuwa: `https://dirham-exchange-tz.netlify.app`

---

## Hatua 4: Unganisha Backend na Frontend

### 4.1 Rudi Render, sasisha FRONTEND_URL
- Render Dashboard → dirham-exchange-api → Environment
- Badilisha `FRONTEND_URL` kuwa URL yako ya Netlify
- Bonyeza "Save Changes" - itawaka upya

---

## ✅ Angalizo Muhimu (Render Free Plan)

Render free plan "inazima" baada ya dakika 15 bila matumizi.
Wakati wa kwanza kuitumia tena, itachukua sekunde 30-60 kuamka.

**Suluhisho:** Tumia UptimeRobot (https://uptimerobot.com) BURE:
1. Tengeneza akaunti
2. "Add New Monitor" → HTTP(s)
3. URL: `https://dirham-exchange-api.onrender.com/api/health`
4. Interval: 5 dakika
Hii itaizuia kuzima!

---

## 🛠️ Jinsi ya Kurekebisha (Customize)

### Kubadilisha Rangi
Faili: `frontend/tailwind.config.ts`
```typescript
colors: {
  primary: {
    DEFAULT: '#2530F8',  // Badilisha hapa
  }
}
```

### Kuongeza Aina ya Gharama
Faili: `frontend/app/expenses/page.tsx`
```typescript
const CATEGORIES = ['Nauli/Usafiri', 'Nyongeza yako hapa', ...];
```

### Kubadilisha Sarafu
Badilisha `AED` na `TZS` kwenye files zote au ongeza sarafu mpya kwenye dropdown za forms.

### Kuongeza Lugha
Badilisha maandishi yote kwenye pages kutoka Kiswahili kwenda Kiingereza au lugha nyingine.

### Kuongeza Features
- `backend/src/routes/` - Ongeza routes mpya
- `frontend/app/` - Ongeza pages mpya  
- `backend/prisma/schema.prisma` - Ongeza models mpya kwenye database

---

## 💻 Amri za Muhimu

```bash
# Development
cd backend && npm run dev     # Anza backend
cd frontend && npm run dev    # Anza frontend

# Database
cd backend
npm run db:push              # Sasisha database bila migrate
npm run db:migrate           # Tengeneza migration
npm run db:generate          # Generate Prisma client

# Build kwa production
cd backend && npm run build
cd frontend && npm run build
```

---

## 🆘 Matatizo ya Kawaida na Ufumbuzi

### "Cannot connect to database"
→ Hakikisha DATABASE_URL ni sahihi kwenye .env

### "CORS error" kwenye browser
→ Hakikisha FRONTEND_URL kwenye backend .env ni URL sahihi ya Netlify

### "Module not found"
→ Fanya `npm install` tena kwenye folder sahihi

### Render inachukua muda kujibu
→ Ni ya kawaida kwa free plan. Weka UptimeRobot kuzuia hili.

---

**Msaada:** Ikiwa kuna tatizo, angalia logs kwenye Render dashboard au Netlify deploy logs.
