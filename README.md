# 🥭 Mango - AI Solutions for SMEs

Fast, affordable AI agents that help small businesses understand their finances and customers in minutes, not months.

## 📂 What's Included

```
mango-netlify/
├── src/
│   └── index.html                      # Website (deploy to Netlify)
├── agents/
│   └── run_agents.py                   # Run locally on your Mac/Linux
├── data/
│   ├── sample_fha_data.csv             # Sample P&L for testing
│   └── sample_cid_data.csv             # Sample customer data
├── dashboards/
│   ├── dashboard.html                  # Upload JSON results to view
│   └── dashboard_shareable.html        # Share results via URL
└── docs/
    └── deployment.md                   # Netlify setup guide
```

## 🚀 Start Here (5 Minutes)

### Step 1: Deploy Website
Go to **netlify.com/drop** → Drag `src/index.html` → Live in 30 seconds ✅

### Step 2: Run Agents Locally
```bash
# Install SDK
pip3 install anthropic

# Set your API key
export ANTHROPIC_API_KEY="sk-ant-YOUR-KEY"

# Test with sample data
python3 agents/run_agents.py data/sample_fha_data.csv
python3 agents/run_agents.py data/sample_cid_data.csv

# Creates: sample_fha_data_results.json + sample_cid_data_results.json
```

### Step 3: View Results
Open `dashboards/dashboard_shareable.html` in browser → Upload the JSON files → **Copy the shareable link** → Send to anyone

## 💰 What You Get

### 📊 FHA Agent (Financial Health Analyzer)
**Upload:** 12 months of P&L (Revenue, COGS, Expenses)

**Get:**
- **5 cost savings** with $$ impact (avg $50K/year for SMEs)
- **5 revenue opportunities** with upside potential
- **Key metrics:** margins, growth trends
- **Risk warnings** and structural issues
- **Actionable recommendations** ranked by impact

### 👥 CID Agent (Customer Intelligence Detector)
**Upload:** Customer list with spend + activity

**Get:**
- **Segmentation:** High/Mid/Low value breakdown
- **Concentration risk:** Are you dependent on a few customers?
- **Churn signals:** Which customers are at risk?
- **LTV vs CAC:** Is your acquisition model sustainable?
- **5 retention strategies** with expected impact

## 🔧 Real Data Workflow

1. Export your **P&L** from QuickBooks/Xero as CSV
2. Run: `python3 agents/run_agents.py ~/my_plnl.csv`
3. Get: `~/my_plnl_results.json`
4. Upload to dashboard → Share with team/investors

Same for customer data from Salesforce/HubSpot.

## 📋 CSV Format

### FHA P&L
Any of these column names work:
- Revenue: `revenue`, `sales`, `income`, `total_revenue`
- Costs: `cogs`, `cost_of_goods`, `expenses`, `operating_expenses`
- Also include: `rent`, `salaries`, `marketing`, etc.

**Ideal:** 12-24 rows (months) to spot trends

### CID Customers
Any of these column names work:
- ID: `CustomerID`, `customer_id`, `account`, `client`
- Spend: `monthly_spend`, `revenue`, `annual_revenue`, `transactions`
- Activity: `last_purchase_days_ago`, `days_since_active`, `tenure`

**Ideal:** 15+ customers, 6+ months of history

## 🌐 Deploy Everything to Netlify

```
mango-live/
├── index.html
├── dashboard.html
├── dashboard_shareable.html
└── _redirects  (if routing needed)
```

Zip → netlify.com/drop → Live domain 🎉

See `docs/deployment.md` for full instructions.

## 💰 Pricing

- **Website:** FREE (Netlify)
- **Agent runs:** ~$0.01 per analysis
- **API key:** Free tier from Anthropic covers 1000+ analyses
- **Dashboards:** FREE (HTML, no backend)

## ✉️ Questions?

ashishgadnis@gmail.com | +1 (651) 428-0749

---

**Brand:** 🥭 Mango  
**Built with:** Claude Code, Anthropic API, Next.js  
**For:** SMEs & Micro-SMEs who need AI without the enterprise price tag
