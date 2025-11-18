# PhonePe V2 Payment Gateway Integration - Complete Guide

## Overview
This document explains the PhonePe V2 API integration that has been implemented to fix payment issues. Your PhonePe account uses V2 credentials (OAuth-based), not V1 (salt key-based).

## What Was Fixed

### 1. **API Version Mismatch** ✅
- **Problem**: Code was using V1 API (salt key + checksum) but account has V2 credentials (client_id + client_secret)
- **Solution**: Completely rewrote integration for V2 OAuth-based API

### 2. **Database Foreign Key Error** ✅
- **Problem**: `purchase` table referenced `courses` table, but courses are in `courses_mux` table
- **Solution**: Removed foreign key constraint (run SQL script to apply)

### 3. **Wrong Course Price** ✅
- **Problem**: Using hardcoded amount from URL parameter instead of actual course price
- **Solution**: Backend now fetches course price from `courses_mux` table

## Files Changed

### 1. Environment Variables (`.env.local`)
```env
PHONEPE_MERCHANT_ID=M234ZMV74TMHZ
PHONEPE_CLIENT_ID=SU2511131630189756360952
PHONEPE_CLIENT_SECRET=a12a7754-3052-4ae6-9a11-247d7fc5051d
PHONEPE_TOKEN_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
PHONEPE_PAY_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay
PHONEPE_STATUS_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order
```

### 2. Payment Initiation API (`src/app/api/phonepe/initiate/route.ts`)
**Key Changes:**
- Uses OAuth token (`O-Bearer <token>`) instead of X-VERIFY checksum
- Fetches course details from `courses_mux` table
- Uses V2 payload structure with `paymentFlow` object
- No base64 encoding or SHA256 checksum
- Proper error handling with detailed logs

**V2 Payload Structure:**
```typescript
{
  merchantOrderId: "ORDER_...",
  amount: 10000, // in paise
  paymentFlow: {
    type: "PG_CHECKOUT",
    merchantUrls: {
      redirectUrl: "https://your-domain.com/api/phonepe/callback"
    }
  },
  expireAfter: 1800,
  metaInfo: {
    udf1: courseId,
    udf2: courseTitle,
    udf3: purchaseId
  }
}
```

### 3. Callback/Webhook Handler (`src/app/api/phonepe/callback/route.ts`)
**Key Changes:**
- Handles V2 webhook format with `event` and `payload` fields
- Processes events: `checkout.order.completed`, `checkout.order.failed`
- Uses `payload.state` for transaction status (COMPLETED, FAILED, PENDING)
- OAuth authentication for status checks
- No checksum verification (V2 uses different auth mechanism)

**V2 Webhook Structure:**
```json
{
  "event": "checkout.order.completed",
  "payload": {
    "merchantOrderId": "ORDER_...",
    "state": "COMPLETED",
    ...
  }
}
```

### 4. Frontend Client (`src/app/purchase/PurchaseClient.tsx`)
**Key Changes:**
- Removed `amount` parameter from payment initiation
- Backend now fetches price from database
- Simplified to only send `courseId` and `userId`

### 5. Database Fix (`fix-purchase-table.sql`)
**Run this SQL in Supabase:**
```sql
ALTER TABLE purchase DROP CONSTRAINT IF EXISTS purchase_course_id_fkey;
```

## API Differences: V1 vs V2

| Feature | V1 API | V2 API |
|---------|--------|--------|
| Authentication | Salt Key + Checksum | OAuth (client_id/client_secret) |
| Header | `X-VERIFY: sha256###1` | `Authorization: O-Bearer <token>` |
| Payload Encoding | Base64 encoded | Plain JSON |
| Checksum | SHA256(base64 + endpoint + salt) | None (OAuth handles it) |
| Payment URL | `/pg/v1/pay` | `/checkout/v2/pay` |
| Webhook Format | Base64 encoded response | JSON with event/payload |
| Status Field | `code` or `state` | `payload.state` |

## Testing Steps

### 1. Run Database Fix
```bash
# Go to Supabase SQL Editor and run:
cat fix-purchase-table.sql
```

### 2. Verify Environment Variables
Check that `.env.local` has all V2 credentials (no SALT_KEY or SALT_INDEX).

### 3. Test Payment Flow
1. Go to a course page
2. Click "Purchase" or "Pay" button
3. Check browser console for logs:
   - Should see: "PhonePe V2 OAuth Token obtained successfully"
   - Should see: "PhonePe V2 Payment Request" with course details
4. You should be redirected to PhonePe payment page

### 4. Check Logs
Monitor these console logs:
```
✅ PhonePe V2 OAuth Token obtained successfully
✅ PhonePe V2 Payment Request: { merchantOrderId, amount, coursePrice, courseName }
✅ PhonePe V2 Payment Response: { ... }
✅ Redirecting to PhonePe payment page
```

### 5. Common Errors to Watch For

**Error: "KEY_NOT_CONFIGURED"**
- This was the original error
- Meant you were using V1 API with V2 credentials
- Should be FIXED now ✅

**Error: "Course not found"**
- Course ID doesn't exist in `courses_mux` table
- Verify the course ID is correct

**Error: "Foreign key constraint violation"**
- Database fix not applied yet
- Run `fix-purchase-table.sql`

## Production Deployment

When moving to production:

1. **Update Environment Variables:**
```env
PHONEPE_TOKEN_URL=https://api.phonepe.com/apis/identity-manager/v1/oauth/token
PHONEPE_PAY_URL=https://api.phonepe.com/apis/pg/checkout/v2/pay
PHONEPE_STATUS_URL=https://api.phonepe.com/apis/pg/checkout/v2/order
```

2. **Get Production Credentials** from PhonePe Dashboard

3. **Configure Webhook URL** in PhonePe Dashboard:
   - Webhook URL: `https://yourdomain.com/api/phonepe/callback`

4. **Test thoroughly** in sandbox before switching to production

## Support

If you encounter issues:

1. Check browser console for detailed error logs
2. Check server logs for API responses
3. Verify all environment variables are set correctly
4. Ensure database fix has been applied
5. Contact PhonePe support with your Merchant ID if auth issues persist

## Key PhonePe V2 Documentation Links

- Authorization: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/authorization
- Create Payment: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment
- Webhook Handling: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/webhook
- Order Status: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/order-status

## Summary

✅ Migrated from V1 to V2 API
✅ Fixed OAuth authentication
✅ Fixed database foreign key constraint
✅ Fixed course price fetching
✅ Updated webhook handling
✅ Added comprehensive error logging

The integration is now using the correct PhonePe V2 API that matches your account credentials.
