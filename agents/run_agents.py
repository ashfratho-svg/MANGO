#!/usr/bin/env python3

import os
import sys
import csv
import json
from pathlib import Path
from anthropic import Anthropic

client = Anthropic()

def load_csv(filepath):
    """Load CSV file and return data as dict."""
    rows = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    return rows

def detect_agent_type(csv_data):
    """Detect agent type based on CSV headers."""
    if not csv_data:
        return None
    headers = list(csv_data[0].keys())
    
    # FHA detection: P&L columns (Revenue, COGS, etc.)
    fha_indicators = ['revenue', 'cogs', 'gross_profit', 'opex', 'net_income']
    if any(h.lower() in fha_indicators for h in headers):
        return 'FHA'
    
    # CID detection: Customer columns (customer_id, revenue, transactions, etc.)
    cid_indicators = ['customer_id', 'customer_name', 'transactions', 'annual_revenue', 'churn']
    if any(h.lower() in cid_indicators for h in headers):
        return 'CID'
    
    return None

def run_fha_agent(csv_data):
    """Run Financial Health Analyzer agent."""
    csv_text = json.dumps(csv_data, indent=2)
    
    prompt = f"""You are a Financial Health Analyzer for small businesses. Analyze the provided 12-month P&L data and provide:

1. **key_metrics**: gross_margin_pct, operating_margin_pct, revenue_growth_pct, avg_monthly_revenue
2. **cost_savings**: List 5 specific cost-reduction opportunities with estimated_annual_savings ($$)
3. **revenue_opportunities**: List 5 specific revenue-growth opportunities with estimated_annual_upside ($$)
4. **risks**: List 5 key risks or structural issues in the financials
5. **recommendations**: List 5 actionable next steps

Return ONLY valid JSON (no markdown, no extra text). Structure:
{{
  "key_metrics": {{}},
  "cost_savings": [{{"opportunity": "...", "estimated_annual_savings": 0}}],
  "revenue_opportunities": [{{"opportunity": "...", "estimated_annual_upside": 0}}],
  "risks": ["..."],
  "recommendations": ["..."]
}}

P&L Data:
{csv_text}"""
    
    print("💰 Financial Health Analyzer")
    print("=" * 50)
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    
    result_text = response.content[0].text
    
    # Try to parse JSON
    try:
        # Clean up any markdown code blocks
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(result_text)
    except json.JSONDecodeError:
        print("Raw response (JSON parsing failed):")
        print(result_text)
        result = {"raw_response": result_text}
    
    return result

def run_cid_agent(csv_data):
    """Run Customer Intelligence Detector agent."""
    csv_text = json.dumps(csv_data, indent=2)
    
    prompt = f"""You are a Customer Intelligence Detector for small businesses. Analyze the provided customer transaction data and provide:

1. **segmentation**: High/Mid/Low-value customer counts and characteristics
2. **concentration_risk**: Top 3 customers' percentage of revenue
3. **churn_trends**: Churn rate and at-risk customers
4. **at_risk_customers**: List customers showing decline patterns
5. **ltv_vs_cac**: Customer lifetime value vs acquisition cost insights
6. **recommendations**: List 5 actionable retention/growth strategies

Return ONLY valid JSON (no markdown, no extra text). Structure:
{{
  "segmentation": {{}},
  "concentration_risk": {{}},
  "churn_trends": {{}},
  "at_risk_customers": [],
  "ltv_vs_cac": {{}},
  "recommendations": ["..."]
}}

Customer Data:
{csv_text}"""
    
    print("👥 Customer Intelligence Detector")
    print("=" * 50)
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    
    result_text = response.content[0].text
    
    # Try to parse JSON
    try:
        # Clean up any markdown code blocks
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(result_text)
    except json.JSONDecodeError:
        print("Raw response (JSON parsing failed):")
        print(result_text)
        result = {"raw_response": result_text}
    
    return result

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 run_agents.py <csv_file>")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    # Load CSV
    print(f"📊 Loading CSV: {csv_file}")
    csv_data = load_csv(csv_file)
    print(f"✅ Loaded {len(csv_data)} rows\n")
    
    # Detect agent type
    agent_type = detect_agent_type(csv_data)
    if not agent_type:
        print("❌ Could not detect agent type from CSV headers")
        sys.exit(1)
    
    print(f"🤖 Detected agent type: {agent_type}")
    print("⏳ Running agent (60 seconds)...\n")
    
    # Run appropriate agent
    if agent_type == 'FHA':
        result = run_fha_agent(csv_data)
        output_file = csv_file.replace('.csv', '_results.json')
    else:  # CID
        result = run_cid_agent(csv_data)
        output_file = csv_file.replace('.csv', '_results.json')
    
    # Save results to JSON file
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print("\n" + "=" * 50)
    print(f"✅ Agent test complete!")
    print(f"📁 Results saved to: {output_file}\n")
    print("Preview:")
    print(json.dumps(result, indent=2)[:500] + "...")

if __name__ == "__main__":
    main()
