# 🚀 Deploying Mango to Netlify

## Option 1: Easiest (30 Seconds)

1. Go to **[netlify.com/drop](https://netlify.com/drop)**
2. Drag `src/index.html` onto the drop zone
3. Wait 10 seconds
4. You get a **live URL** 🎉

That's it! Your site is live.

---

## Option 2: Deploy with Dashboards Too

If you want the website + both dashboards on Netlify:

### Create a Netlify folder structure

```
mango-site/
├── index.html              (from src/)
├── dashboard.html          (from dashboards/)
├── dashboard-shareable.html (from dashboards/)
└── _redirects              (create this file)
```

### Create `_redirects` file

```
/*  /index.html   200
```

This ensures all routes go to index.html (in case you add routing later).

### Deploy

1. Go to **netlify.com/drop**
2. Drag the `mango-site/` folder
3. Your site + dashboards are now live
4. Navigation works: 
   - `yoursite.netlify.app` → website
   - `yoursite.netlify.app/dashboard.html` → results viewer
   - `yoursite.netlify.app/dashboard-shareable.html` → shareable version

---

## Option 3: GitHub + Netlify (Recommended)

Better for team collaboration and automatic updates.

### 1. Create GitHub Repo

```bash
cd mango-netlify
git init
git add .
git commit -m "Initial Mango deployment"
git remote add origin https://github.com/YOUR-USERNAME/mango.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to **app.netlify.com**
2. Click **"New site from Git"**
3. Select **GitHub**
4. Choose your `mango` repo
5. Leave build settings blank (static site)
6. Click **Deploy**

### 3. Auto-Deploys On Push

Every time you push to GitHub, Netlify automatically rebuilds and deploys.

```bash
# Edit src/index.html locally
git add .
git commit -m "Update homepage"
git push

# Site updates automatically! 🚀
```

---

## Connecting a Custom Domain

### Step 1: Buy Domain

Get a domain from:
- Google Domains
- Namecheap
- GoDaddy
- Any registrar

### Step 2: Add to Netlify

1. Go to Netlify dashboard → **Site Settings**
2. Click **Domain Management**
3. Click **Add Custom Domain**
4. Enter `mango-intel.com` (or your domain)
5. Click **Verify**

### Step 3: Update Nameservers

In your domain registrar's dashboard:

1. Find **Nameserver Settings**
2. Replace with Netlify's nameservers (Netlify tells you which ones)
3. Save

### Step 4: Wait

DNS takes 24-48 hours to propagate. During this time:
- `yourdomain.netlify.app` → Your site (works immediately)
- `mango-intel.com` → Your site (works after DNS updates)

---

## Recommended Setup

| Component | URL | Where |
|-----------|-----|-------|
| Website | mango-intel.com | Netlify (free) |
| Dashboard | dashboards.mango-intel.com | Netlify (free, subdomain) |
| API endpoint | (optional, use Anthropic directly) | - |

**Cost:** $0/month hosting + domain (~$10-15/year)

---

## Troubleshooting

### Site deployed but shows "Page Not Found"

**Problem:** Wrong file being served

**Solution:** Make sure you uploaded `index.html` to root, not nested in a folder

### Dashboard not loading JSON

**Problem:** File upload failing

**Solution:** Make sure you're using the `dashboard_shareable.html` version (it has file upload built in)

### Changes not showing after push

**Problem:** GitHub push didn't trigger rebuild

**Solution:** 
1. Go to Netlify dashboard
2. Click **Deployments**
3. Click **Trigger Deploy** → **Deploy Site**

### Custom domain not working

**Problem:** DNS not propagated yet

**Solution:** Wait another 24 hours, then try again. Check propagation at:
- https://dnschecker.org (enter your domain)

---

## Environment Variables (If Needed Later)

If you add backend code to Netlify Functions:

1. Netlify dashboard → **Site Settings**
2. → **Build & Deploy** → **Environment**
3. Add variables:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
   - `STRIPE_KEY` = `sk_live_...`

They're automatically available to your functions.

---

## Next Steps

✅ Website deployed  
✅ Dashboards ready  
🔄 Next: Run agents, collect results, share via dashboard  

See main `README.md` for agent setup.
