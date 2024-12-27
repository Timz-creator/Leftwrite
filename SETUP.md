## 1. Authentication (Firebase)

### Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Email/Password authentication
4. Get your project credentials from Project Settings
5. Replace the Firebase config in `src/services/firebase/config.ts`:

# Leftwrite Chrome Extension Setup Guide

## Table of Contents

1. [Authentication (Firebase)](#1-authentication-firebase)
2. [Payment Integration (ExtensionPay)](#2-payment-integration-extensionpay)
3. [AI Configuration (Anthropic/Claude)](#3-ai-configuration-anthropicclaude)
4. [Styling & Branding](#4-styling--branding)
5. [Build & Deployment](#5-build--deployment)
6. [Monitoring & Maintenance](#6-monitoring--maintenance)

## 2. Payment Integration (ExtensionPay)

### Account Setup

1. Create account at [ExtensionPay](https://extensionpay.com)
2. Create a new product for your extension
3. Note your product ID
4. Replace in `src/services/payments/extensionPay.ts`:

### Payment Settings

- Trial Period: 7 days (configurable in extensionPay.ts)
- Monthly Analysis Limit: 10 (configurable in extensionPay.ts)
- Customize pricing in ExtensionPay dashboard

## 3. AI Configuration (Anthropic/Claude)

### API Setup

1. Get API key from [Anthropic](https://anthropic.com)
2. Create/edit `.env.local` file in root directory:

### Usage Settings

- Default prompt templates in `src/services/anthropic.ts`
- Response formatting can be customized
- Monitor API usage in Anthropic dashboard

## 4. Styling & Branding

### Logo

1. Replace logo:
   - Path: `src/assets/logo.png`
   - Size: 128x128px recommended
   - Format: PNG with transparency

### Colors

1. Edit `tailwind.config.js`:

### Extension Details

1. Update `manifest.json`:

## 5. Build & Deployment

### Local Testing

1. Install dependencies:

2. Build extension:

3. Load in Chrome:
   - Go to chrome://extensions/
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `dist` folder

### Chrome Web Store Publishing

1. Required assets:

   - Small icon (128x128)
   - Screenshots (1280x800)
   - Promotional images
   - Privacy policy
   - Description

2. Submission:
   - Create account on [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay one-time developer fee
   - Submit extension for review

## 6. Monitoring & Maintenance

### Usage Monitoring

Monitor through:

- ExtensionPay dashboard: Payment/trial status
- Firebase Console: User authentication
- Anthropic Dashboard: API usage

### Error Checking

View errors in:

- Chrome extension console
- Firebase Console
- Background script logs

### Regular Tasks

1. API Key Management:

   - Rotate keys periodically
   - Monitor usage limits
   - Update `.env.local` when changed

2. Updates:

   - Check dependencies monthly
   - Monitor API version changes
   - Test after updates

3. User Support:
   - Monitor support email
   - Check ExtensionPay notifications
   - Review user feedback

## Important Notes

### Security

- Never commit `.env.local`
- Keep API keys secure
- Monitor for unusual activity
- Regular security audits

### Costs to Monitor

- Anthropic API usage
- Firebase usage (auth)
- ExtensionPay fees
- Chrome Web Store fees

### Support Contacts

- Technical Issues: [your-tech-email]
- User Support: [your-support-email]
- Billing Questions: [your-billing-email]

For additional help or customization, contact [your-company-email]
