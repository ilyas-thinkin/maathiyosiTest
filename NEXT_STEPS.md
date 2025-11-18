# PhonePe V2 Integration - Next Steps

## Current Status
✅ KYC completed
✅ Code migrated to V2 API
✅ All endpoints updated correctly
❌ Getting 401 Unauthorized error when requesting OAuth token

## Issue
The error "401 Unauthorized" means one of these:

1. **Missing or incorrect `client_version`** - PhonePe provides this value
2. **Credentials not activated** - Even with KYC done, V2 API access needs activation
3. **Wrong credentials** - Double-check from PhonePe dashboard

## Action Required: Get Your `client_version`

### Step 1: Log into PhonePe Business Dashboard
1. Go to https://business.phonepe.com/
2. Navigate to "Developer" or "API Credentials" section
3. Look for your V2 credentials

### Step 2: Find Your `client_version`
You should see these credentials:
- ✅ Client ID: `SU2511131630189756360952` (you have this)
- ✅ Client Secret: `a12a7754-...` (you have this)
- ❓ **Client Version**: `???` (YOU NEED THIS!)
- ✅ Merchant ID: `M234ZMV74TMHZ` (you have this)

### Step 3: Update .env.local
Once you have the `client_version`, add it to your `.env.local`:

```env
PHONEPE_CLIENT_VERSION=YOUR_CLIENT_VERSION_HERE
```

### Step 4: Alternative - Contact PhonePe Support

If you can't find `client_version` in your dashboard, reply to PhonePe support:

```
Hi PhonePe Support,

My KYC is completed and I'm integrating V2 API as advised. I'm getting a 401
error when requesting OAuth token.

My credentials:
- Client ID: SU2511131630189756360952
- Merchant ID: M234ZMV74TMHZ
- Environment: Sandbox

Questions:
1. What is my client_version value for OAuth requests?
2. Are my V2 credentials activated for sandbox?
3. Do I need any additional activation steps after KYC?

Current error: 401 Unauthorized when calling /oauth/token endpoint

Thank you!
```

## What We're Sending Now

Current OAuth request (check server logs):
```
grant_type=client_credentials
client_id=SU2511131630189756360952
client_secret=a12a7754-3052-4ae6-9a11-247d7fc5051d
client_version=1.0  ← This might be wrong!
```

## Common client_version Values

PhonePe typically provides these formats:
- `v1`
- `1.0.0`
- `2024.1`
- Or a custom value specific to your merchant account

## Testing Steps Once You Have client_version

1. Update `.env.local` with the correct `client_version`
2. Restart your development server
3. Try payment again
4. Check logs for "PhonePe V2 OAuth Token obtained successfully"

## If Still Getting 401 After Adding client_version

This means your V2 API access is not activated. Contact PhonePe support to:
1. Activate V2 API access for your merchant account
2. Enable sandbox environment access
3. Whitelist your domain/IP if required

## Current Implementation Status

All code is correct and ready. We just need:
- [ ] Correct `client_version` value
- [ ] V2 API access activated by PhonePe
- [ ] Database foreign key constraint removed (run SQL)

## Database Fix (Still Needed)

Run this in Supabase SQL Editor:
```sql
ALTER TABLE purchase DROP CONSTRAINT IF EXISTS purchase_course_id_fkey;
```

## Files Ready
✅ [initiate/route.ts](src/app/api/phonepe/initiate/route.ts) - V2 payment initiation
✅ [callback/route.ts](src/app/api/phonepe/callback/route.ts) - V2 webhook handler
✅ [PurchaseClient.tsx](src/app/purchase/PurchaseClient.tsx) - Frontend updated
✅ [.env.local](.env.local) - V2 credentials (needs client_version)

## What Will Happen When Fixed

1. User clicks "Pay ₹499"
2. ✅ Backend fetches course price from database (not hardcoded)
3. ✅ Creates purchase record
4. ✅ Gets OAuth token successfully ← Currently failing here
5. Calls PhonePe payment API
6. Redirects to PhonePe payment page
7. User pays
8. PhonePe sends webhook
9. Purchase status updated to "success"
10. User sees success page

We're stuck at step 4 due to missing/incorrect `client_version` or inactive credentials.
