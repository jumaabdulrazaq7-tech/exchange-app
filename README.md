# 💱 Dirham Exchange Manager

Mfumo wa kisasa wa SaaS kwa ajili ya kusimamia biashara ya kubadilishana fedha AED ↔ TZS.

## 🚀 Jinsi ya Kuanza (Development)

### Mahitaji
- Node.js v18+
- PostgreSQL database
- npm au yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Hariri .env uweke DATABASE_URL yako
npm run db:generate
npm run db:push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Tengeneza .env.local na:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

Fungua http://localhost:3000

## 📦 Sehemu za App
- 📊 **Dashboard** - Muhtasari wa biashara, bei ya sasa, salio
- 🔄 **Miamala** - Rekodi za kununua na kuuza AED
- 👥 **Wateja** - Usimamizi wa wateja na historia yao
- 💸 **Gharama** - Rekodi za matumizi ya biashara
- 🤝 **Madeni & Mikopo** - Mikopo na madeni
- 📈 **Ripoti** - Ripoti kamili na grafu
- ⚙️ **Mipangilio** - Mipangilio ya akaunti

## 🌐 Kuhost Bure (GitHub + Netlify + Render)
Angalia faili `DEPLOYMENT_GUIDE.md` kwa maelekezo kamili.

## 🎨 Rangi za App
- Primary: #2530F8 (Blue)
- White: #FFFFFF
- Background: #F8F9FF
