# Deployment Guide for Lodes Affiliate

This guide explains how to deploy your Next.js application to **Vercel**, the recommended platform for Next.js apps.

## Prerequisites

1.  **GitHub Account**: Ensure your project is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy on Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `lodes-affiliate` repository.
4.  In the **Configure Project** screen:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `next build` (default).
    *   **Output Directory**: `.next` (default).

## Step 3: Configure Environment Variables

Expand the **"Environment Variables"** section and add the following keys. You can find the values in your local `.env.local` file (do not copy the file itself, just the values).

| Key | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BASE_URL` | Your production URL | `https://your-project.vercel.app` |
| `GOOGLE_SHEET_ID` | ID of your Google Sheet | `1BxiMVs0XRA5nFMdKvBdBZj...` |
| `GOOGLE_CREDENTIALS` | JSON string of your Google service account | `{"type": "service_account", ...}` |
| `JWT_SECRET` | Secret key for authentication | `your-secure-random-secret-key` |

> **Note**: For `GOOGLE_CREDENTIALS`, ensure the value is the full JSON string without newlines if possible, or paste it carefully.

## Step 4: Deploy

Click **"Deploy"**. Vercel will build your application and assign it a domain (e.g., `lodes-affiliate.vercel.app`).

## Verifying Deployment

1.  Visit the deployed URL.
2.  Test the **Admin Login** and **Affiliate Login**.
3.  Test a **Withdrawal Request** to ensure database/API connections work.
4.  Test **Order Submission** to ensure Google Sheets integration works.

## Troubleshooting

*   **Build Failures**: Check the "Logs" tab in Vercel for error messages.
*   **500 Errors**: Usually indicate missing or incorrect environment variables. Check the "Settings" > "Environment Variables" in Vercel.
