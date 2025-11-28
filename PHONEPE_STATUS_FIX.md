# PhonePe Payment Status Fix

## Problem
Payments were completing successfully on PhonePe, but the `purchase` table status remained "pending" instead of updating to "success".

## Root Cause Analysis

### Issue 1: Missing Status Codes
The callback and webhook handlers were only checking for limited status values:
- Only checked `state === "COMPLETED"`
- Didn't check for `code === "PAYMENT_SUCCESS"` or `code === "SUCCESS"`
- PhonePe V2 API can return status in multiple formats and fields

### Issue 2: Incomplete Response Parsing
The code wasn't checking all possible locations where PhonePe returns status:
- `response.state`
- `response.data.state`
- `response.payload.state`
- `response.code`
- `response.data.code`
- `response.payload.code`

### Issue 3: Limited Logging
There wasn't enough logging to debug what status PhonePe was actually returning.

## What Was Fixed

### 1. Updated Callback Handler ([callback/route.ts](src/app/api/phonepe/callback/route.ts))

**GET Handler (User Redirect):**
```typescript
// Now checks ALL possible status fields
const state = statusResponse.state ||
              statusResponse.payload?.state ||
              statusResponse.data?.state ||
              statusResponse.status;

const code = statusResponse.code ||
             statusResponse.payload?.code ||
             statusResponse.data?.code;

// Check for ALL success variations
if (state === "COMPLETED" ||
    code === "PAYMENT_SUCCESS" ||
    code === "SUCCESS" ||
    state === "SUCCESS") {
  updateStatus = "success";
}
```

**POST Handler (PhonePe Webhook):**
```typescript
// Check both state and code fields
const payloadState = payload.state || payload.status;
const payloadCode = payload.code;

// Comprehensive status mapping
if (event === "checkout.order.completed" ||
    payloadState === "COMPLETED" ||
    payloadState === "SUCCESS" ||
    payloadCode === "PAYMENT_SUCCESS" ||
    payloadCode === "SUCCESS") {
  updateStatus = "success";
}
```

### 2. Updated Webhook Handler ([webhook/route.ts](src/app/api/phonepe/webhook/route.ts))

```typescript
// Extract from multiple possible locations
const phonepeStatus =
  body?.status ||
  body?.data?.status ||
  body?.state ||
  body?.data?.state ||
  body?.payload?.state;

const phonepeCode =
  body?.code ||
  body?.data?.code ||
  body?.payload?.code;

// Map all possible success statuses
if (phonepeStatus === "SUCCESS" ||
    phonepeStatus === "PAYMENT_SUCCESS" ||
    phonepeStatus === "COMPLETED" ||
    phonepeCode === "PAYMENT_SUCCESS" ||
    phonepeCode === "SUCCESS") {
  mappedStatus = "success";
}

// Try transaction_id first, then fall back to order_id
await supabase
  .from("purchase")
  .update({ status: mappedStatus, ... })
  .eq("transaction_id", merchantOrderId);
```

### 3. Added Comprehensive Logging

All handlers now log:
- Full webhook/callback payloads
- Extracted state and code values
- Update operations and their results
- Error details with stack traces

### 4. Created Manual Verification Endpoint

**New endpoint:** `/api/phonepe/verify-pending`

This endpoint allows you to manually verify and update any pending payment:

```bash
GET /api/phonepe/verify-pending?transactionId=ORDER_xxx
```

**Features:**
- Fetches current purchase status from database
- Calls PhonePe status API to get latest payment status
- Updates purchase status if needed
- Returns detailed response with before/after status

**Example Response:**
```json
{
  "success": true,
  "transactionId": "ORDER_1732704000000_ABC123",
  "previousStatus": "pending",
  "currentStatus": "success",
  "phonepeResponse": { ... },
  "message": "Payment verified and status updated to success!"
}
```

## How to Use

### For Future Payments

The fixes are now in place. All new payments will automatically:
1. Get checked when user is redirected after payment
2. Receive webhook updates from PhonePe (if configured)
3. Update to correct status based on comprehensive status checks

### For Existing Pending Payments

Use the verification endpoint to fix stuck pending payments:

1. **Find pending transactions:**
   - Check your Supabase `purchase` table
   - Filter by `status = 'pending'`
   - Get the `transaction_id` value

2. **Verify payment:**
   ```
   https://yourdomain.com/api/phonepe/verify-pending?transactionId=ORDER_xxx
   ```

3. **Check response:**
   - If payment was successful, status will be updated to "success"
   - Response shows previous and current status

### Batch Update (Optional)

If you have many pending transactions, you can create a script:

```typescript
// Get all pending purchases
const { data: pending } = await supabase
  .from("purchase")
  .select("transaction_id")
  .eq("status", "pending");

// Verify each one
for (const purchase of pending) {
  const response = await fetch(
    `/api/phonepe/verify-pending?transactionId=${purchase.transaction_id}`
  );
  const result = await response.json();
  console.log(result);
}
```

## Testing

### Test the Fix:

1. **Make a test payment:**
   - Go to any course page
   - Click purchase/pay button
   - Complete payment on PhonePe sandbox

2. **Check server logs:**
   ```
   ✅ Checking payment status for order: ORDER_xxx
   ✅ PhonePe status response: { state: "COMPLETED", ... }
   ✅ Extracted state: COMPLETED code: PAYMENT_SUCCESS
   ✅ Updating purchase status to: success
   ✅ Successfully updated purchase status to: success
   ```

3. **Verify in database:**
   - Check `purchase` table
   - Status should be "success"
   - `payment_response` column should contain PhonePe response

### Test Verification Endpoint:

```bash
# Replace with actual transaction ID
curl "https://yourdomain.com/api/phonepe/verify-pending?transactionId=ORDER_xxx"
```

## Status Mapping Reference

| PhonePe Status | Database Status |
|---------------|----------------|
| `state: "COMPLETED"` | `success` |
| `code: "PAYMENT_SUCCESS"` | `success` |
| `code: "SUCCESS"` | `success` |
| `state: "SUCCESS"` | `success` |
| `state: "PENDING"` | `pending` |
| `code: "PAYMENT_PENDING"` | `pending` |
| `state: "FAILED"` | `failed` |
| `code: "PAYMENT_FAILED"` | `failed` |
| Everything else | `failed` |

## What Still Needs Configuration

### PhonePe Dashboard Webhook Setup (Optional but Recommended)

Currently, status updates happen when the user is redirected back. For better reliability, configure webhooks in PhonePe dashboard:

1. **Login to PhonePe Merchant Dashboard**
2. **Go to Webhooks/Notifications settings**
3. **Add webhook URL:**
   ```
   https://yourdomain.com/api/phonepe/webhook
   ```
   OR
   ```
   https://yourdomain.com/api/phonepe/callback
   ```
4. **Enable events:**
   - Payment Success
   - Payment Failed
   - Payment Pending

This ensures status updates even if user closes browser after payment.

## Files Modified

1. [src/app/api/phonepe/callback/route.ts](src/app/api/phonepe/callback/route.ts) - Fixed GET and POST handlers
2. [src/app/api/phonepe/webhook/route.ts](src/app/api/phonepe/webhook/route.ts) - Fixed status extraction and mapping
3. [src/app/api/phonepe/verify-pending/route.ts](src/app/api/phonepe/verify-pending/route.ts) - NEW: Manual verification endpoint

## Summary

✅ Fixed status code detection to handle all PhonePe V2 response formats
✅ Added comprehensive logging for debugging
✅ Created manual verification endpoint for stuck payments
✅ Updated all handlers to check multiple status field locations
✅ Added fallback database lookups (transaction_id and order_id)

The payment status should now update correctly to "success" when payments complete on PhonePe!
