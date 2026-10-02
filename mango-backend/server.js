import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import multer from "multer";
import cors from "cors";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic();

// Configure SendGrid
const sendgridKey = process.env.SENDGRID_API_KEY;
if (sendgridKey && sendgridKey.startsWith("SG.")) {
  sgMail.setApiKey(sendgridKey);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".csv", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed"));
    }
  },
});

// Parse CSV data
function parseCSV(data) {
  const lines = data.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Financial Analysis Endpoint
app.post("/api/agents/financial-analysis", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileContent = req.file.buffer.toString("utf-8");
    const data = parseCSV(fileContent);
    if (data.length === 0) {
      return res.status(400).json({ error: "No data found in file" });
    }
    const financialSummary = data
      .map((row) => `${Object.keys(row).map((k) => `${k}: ${row[k]}`).join(", ")}`)
      .slice(0, 20)
      .join("\n");
    const prompt = `You are a financial analyst for small business owners. Analyze this P&L data and provide:
1. **Executive Summary** (1 paragraph): Key financial health indicators
2. **Critical Risks** (3-4 bullets with 🔴🟠🟡 emojis): Main threats to the business
3. **Top 3 AI Opportunities** (brief, with estimated $ impact): Where AI can help most
4. **Conclusion** (1 sentence): Key insight + priority + risk

Keep analysis to 3-4 pages max. Be specific and actionable.

P&L Data:
${financialSummary}

Provide the analysis now:`;
    const message = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const analysis = message.content[0].type === "text" ? message.content[0].text : "";
    res.json({
      analysis,
      fileName: req.file.originalname,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Financial analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze financials",
      details: error.message,
    });
  }
});

// Customer Analysis Endpoint
app.post("/api/agents/customer-analysis", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileContent = req.file.buffer.toString("utf-8");
    const data = parseCSV(fileContent);
    if (data.length === 0) {
      return res.status(400).json({ error: "No data found in file" });
    }
    const customerSummary = data
      .map((row) => `${Object.keys(row).map((k) => `${k}: ${row[k]}`).join(", ")}`)
      .slice(0, 20)
      .join("\n");
    const prompt = `You are a customer intelligence expert. Analyze this customer data and provide:
1. **Executive Summary** (1 paragraph): Customer base composition and key metrics
2. **Concentration Risks** (3-4 bullets with 🔴🟠🟡 emojis): Over-dependence on key customers
3. **Growth Opportunities** (brief analysis with $ potential): Segments to focus on
4. **Conclusion** (1 sentence): Key insight + priority action + risk

Keep analysis to 3-4 pages max.

Customer Data:
${customerSummary}

Provide the analysis now:`;
    const message = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const analysis = message.content[0].type === "text" ? message.content[0].text : "";
    res.json({
      analysis,
      fileName: req.file.originalname,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Customer analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze customer data",
      details: error.message,
    });
  }
});

// Email Report Endpoint
app.post("/api/email/send-report", async (req, res) => {
  try {
    const { recipientEmail, companyName, reportContent, reportType } = req.body;
    if (!recipientEmail || !reportContent) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const emailContent = `<html><body style="font-family: sans-serif; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #e8640d;">Mango Intel</h1><p style="color: #999;">AI Solutions for Small Business</p><h2>${reportType || "Analysis Report"}</h2><pre style="white-space: pre-wrap;">${reportContent}</pre><p><a href="https://calendly.com/ashishgadnis/free-ai-assessment">Schedule Assessment</a></p><p style="color: #999; font-size: 12px;">© 2026 Mango Intel</p></div></body></html>`;
    if (sendgridKey && sendgridKey.startsWith("SG.")) {
      await sgMail.send({
        to: recipientEmail,
        from: "reports@mango-intel.com",
        subject: `Your ${reportType || "Analysis"} Report from Mango Intel`,
        html: emailContent,
      });
    }
    res.json({
      success: true,
      message: "Report sent successfully",
      recipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

// Request Full Plan Endpoint
app.post("/api/email/request-full-plan", async (req, res) => {
  try {
    const { recipientEmail, companyName, reportType } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ error: "Email address required" });
    }
    if (sendgridKey && sendgridKey.startsWith("SG.")) {
      await sgMail.send({
        to: "ashishgadnis@gmail.com",
        from: "system@mango-intel.com",
        subject: `New Full Plan Request from ${recipientEmail}`,
        html: `<h2>New Request</h2><p>Email: ${recipientEmail}</p><p>Company: ${companyName || "N/A"}</p>`,
      });
      await sgMail.send({
        to: recipientEmail,
        from: "reports@mango-intel.com",
        subject: "Full 90-Day Plan Request Received",
        html: `<h1 style="color: #e8640d;">Thank You!</h1><p>Your request has been received. Ashish will reach out within 24 hours.</p>`,
      });
    }
    res.json({
      success: true,
      message: "Request received.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Plan request error:", error);
    res.status(500).json({
      error: "Failed to process request",
      details: error.message,
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ injected env from .env`);
  if (process.env.SENDGRID_API_KEY?.startsWith("SG.")) {
    console.log("✓ SendGrid API key configured");
  } else {
    console.log("API key does not start with 'SG.'.");
  }
  console.log(`Server running on port ${PORT}`);
});
