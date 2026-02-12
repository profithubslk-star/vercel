# Deriv OAuth Integration Setup

This document explains how to set up Deriv OAuth integration for your trading platform.

## Overview

The platform now supports two methods for connecting Deriv accounts:
1. **OAuth (Recommended for Production)**: Secure, no API tokens needed
2. **API Token**: Manual token entry (works for development and production)

## Important Note About Localhost

**Deriv OAuth does NOT accept `localhost` URLs.** You must use one of these options:

### Option A: Use ngrok for Local Testing (Recommended)
1. Install [ngrok](https://ngrok.com/download)
2. Run: `ngrok http 5173`
3. Use the HTTPS URL ngrok provides (e.g., `https://abc123.ngrok.io/auth/callback`)
4. This URL changes each time you restart ngrok

### Option B: Use a Staging/Production Domain
1. Deploy your app to a hosting service
2. Use your actual domain URL

### Option C: Use API Token Method for Development
Until you have a public URL, use the API Token method in Settings > Integrations > Option 2

## OAuth Setup Instructions

### Option 1: Using an Existing App ID (Recommended for Testing)

If you already have a Deriv App ID from another project, **you can reuse it**! This won't affect your other website at all.

1. Go to [Deriv API Dashboard](https://api.deriv.com/app-registration/)
2. Find your existing application and click to edit it
3. **Add** your new redirect URL to the existing list (don't remove the old one):
   - Development with ngrok: `https://your-ngrok-id.ngrok.io/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
4. Save the changes
5. Copy your App ID

**Why this is safe:**
- Each redirect URL works independently
- Your other website will still use its own redirect URL
- Users will be redirected to the appropriate URL based on where they started
- Multiple domains can share the same App ID without any conflicts

### Option 2: Creating a New App (Alternative)

If you prefer to create a separate app:

1. Go to [Deriv API Dashboard](https://api.deriv.com/app-registration/)
2. Click "Register new application"
3. Fill in the application details:
   - **Application name**: Your platform name
   - **Redirect URLs**: Add your callback URLs (must be HTTPS with a real domain or ngrok):
     - Development with ngrok: `https://your-ngrok-id.ngrok.io/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`
   - **Scopes**: Select all required scopes (read, trade, payments, admin)
4. Submit and note your **App ID**

### Step 2: Configure Your Application

1. Open `.env` file in your project root
2. Replace `your_app_id_here` with your actual Deriv App ID:
   ```
   VITE_DERIV_APP_ID=12345
   ```
3. Save the file and restart your dev server

### Step 3: Test the Integration

**For Development (with ngrok):**
1. Start your dev server: `npm run dev`
2. In another terminal, run: `ngrok http 5173`
3. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
4. Add `/auth/callback` to this URL in your Deriv App settings
5. Access your app using the ngrok URL
6. Navigate to Settings > Integrations
7. Click "Connect with Deriv OAuth"
8. Authorize on Deriv's page
9. You'll be redirected back and automatically logged in

**For Production:**
1. Use your production URL: `https://yourdomain.com/auth/callback`
2. Add this redirect URL in your Deriv App settings
3. Deploy your application
4. Users can now connect via OAuth

## How OAuth Works

1. User clicks "Connect with Deriv OAuth" in Settings
2. Redirected to Deriv's authorization page
3. User authorizes the application
4. Deriv redirects back to `/auth/callback` with tokens
5. Application stores tokens and fetches account data
6. User is logged in and can see their balance

## Features After Connection

- ✅ View account balance in navbar
- ✅ Switch between Demo and Real accounts
- ✅ See proper currency names (US Dollar, Tether TRC20, etc.)
- ✅ Auto-reconnect on page refresh
- ✅ Secure token storage in database

## Redirect URLs Reference

| Environment | Redirect URL |
|------------|-------------|
| Local Development (ngrok) | `https://your-ngrok-id.ngrok.io/auth/callback` |
| Staging | `https://staging.yourdomain.com/auth/callback` |
| Production | `https://yourdomain.com/auth/callback` |

**Note:** Replace `your-ngrok-id` with the actual subdomain from ngrok each time you start it.

## Security Notes

- OAuth tokens are stored securely in Supabase database
- Tokens are never exposed to client-side code
- All API calls go through secure WebSocket connections
- Users can disconnect their account anytime from Settings

## Troubleshooting

### "Authorization Failed" Error
- Check that your App ID is correct
- Verify redirect URL matches exactly (including http/https)
- Ensure your app has the required scopes enabled

### Balance Not Showing
- Check browser console for errors
- Verify Deriv account has API access enabled
- Try disconnecting and reconnecting

### Account Switching Not Working
- Ensure you have multiple accounts in Deriv
- Check that all accounts are accessible via API
- Try refreshing the page

## API Token Fallback

If OAuth is not working, users can still connect using API tokens:
1. Go to [Deriv API Token Manager](https://app.deriv.com/account/api-token)
2. Create a new token with required scopes
3. Copy the token
4. In Settings > Integrations, use "Option 2: API Token"
5. Paste token and click "Connect with API Token"

## Support

For issues with Deriv API integration, refer to:
- [Deriv API Documentation](https://api.deriv.com/docs/)
- [Deriv OAuth Guide](https://api.deriv.com/docs/oauth/)
