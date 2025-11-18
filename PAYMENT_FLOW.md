# PhonePe V2 Payment Flow - Step by Step

## Complete Payment Journey

### 1. User Initiates Payment
**Location:** Course page → Purchase button
**File:** `src/app/purchase/PurchaseClient.tsx`

```typescript
// User clicks "Pay" button
// Frontend sends:
{
  courseId: "5ae63ce5-...",
  userId: "user-uuid"
}
```

### 2. Backend Gets OAuth Token
**File:** `src/app/api/phonepe/initiate/route.ts`
**Function:** `getPhonePeAccessToken()`

```
POST https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token

Body:
  grant_type=client_credentials
  client_id=SU2511131630189756360952
  client_secret=a12a7754-3052-4ae6-9a11-247d7fc5051d

Response:
{
  "access_token": "eyJ...",
  "token_type": "O-Bearer",
  "expires_at": 1234567890
}
```

### 3. Backend Fetches Course Details
**File:** `src/app/api/phonepe/initiate/route.ts`

```typescript
// Query Supabase
SELECT id, title, price
FROM courses_mux
WHERE id = '5ae63ce5-...'

// Example result:
{
  id: "5ae63ce5-...",
  title: "Complete React Course",
  price: 499  // in rupees
}
```

### 4. Backend Creates Purchase Record
**File:** `src/app/api/phonepe/initiate/route.ts`

```typescript
INSERT INTO purchase (
  user_id,
  course_id,
  amount,
  status,
  transaction_id,
  order_id
) VALUES (
  'user-uuid',
  '5ae63ce5-...',
  499,
  'pending',
  'ORDER_1734448731_A1B2C3D4',
  'ORDER_1734448731_A1B2C3D4'
)
```

### 5. Backend Calls PhonePe Payment API
**File:** `src/app/api/phonepe/initiate/route.ts`

```
POST https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay

Headers:
  Content-Type: application/json
  Authorization: O-Bearer eyJ...
  Accept: application/json

Body:
{
  "merchantOrderId": "ORDER_1734448731_A1B2C3D4",
  "amount": 49900,  // 499 * 100 (in paise)
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://maathiyosi.io/api/phonepe/callback"
    }
  },
  "expireAfter": 1800,
  "metaInfo": {
    "udf1": "5ae63ce5-...",  // courseId
    "udf2": "Complete React Course",  // course title
    "udf3": "purchase-uuid"  // purchase ID
  }
}

Response:
{
  "redirectUrl": "https://phonepe.com/payment/ORDER_1734448731_A1B2C3D4",
  "success": true
}
```

### 6. User is Redirected to PhonePe
**File:** `src/app/purchase/PurchaseClient.tsx`

```typescript
// Frontend receives:
{
  success: true,
  paymentUrl: "https://phonepe.com/payment/ORDER_1734448731_A1B2C3D4",
  transactionId: "ORDER_1734448731_A1B2C3D4",
  purchaseId: "purchase-uuid",
  amount: 499
}

// Browser redirects to PhonePe payment page
window.location.href = paymentUrl;
```

### 7. User Completes Payment on PhonePe
**PhonePe Payment Page:**
- User selects payment method (UPI/Card/NetBanking)
- Enters payment details
- Confirms payment

### 8. PhonePe Sends Webhook to Your Server
**File:** `src/app/api/phonepe/callback/route.ts` (POST handler)

```
POST https://maathiyosi.io/api/phonepe/callback

Body:
{
  "event": "checkout.order.completed",
  "payload": {
    "merchantOrderId": "ORDER_1734448731_A1B2C3D4",
    "state": "COMPLETED",
    "amount": 49900,
    "paymentDetails": {
      "method": "UPI",
      "transactionId": "T123456789"
    },
    "timestamp": 1734448900
  }
}
```

### 9. Backend Updates Purchase Status
**File:** `src/app/api/phonepe/callback/route.ts`

```typescript
// Update purchase record
UPDATE purchase
SET
  status = 'success',
  payment_response = '{webhook data}',
  updated_at = NOW()
WHERE transaction_id = 'ORDER_1734448731_A1B2C3D4'
```

### 10. User is Redirected Back (Optional)
**File:** `src/app/api/phonepe/callback/route.ts` (GET handler)

```
PhonePe redirects user to:
GET https://maathiyosi.io/api/phonepe/callback?merchantOrderId=ORDER_1734448731_A1B2C3D4

Backend verifies status and redirects to:
  Success: https://maathiyosi.io/payment/success?transaction_id=ORDER_...
  Failed:  https://maathiyosi.io/payment/failed?transaction_id=ORDER_...
```

## Payment Status Flow

```
User Clicks Pay
    ↓
[PENDING] Purchase record created
    ↓
User redirected to PhonePe
    ↓
User pays on PhonePe
    ↓
PhonePe sends webhook
    ↓
[SUCCESS] Purchase updated ✅
OR
[FAILED] Purchase updated ❌
    ↓
User redirected to success/failure page
```

## Database States

```sql
-- Pending: Payment initiated but not completed
status = 'pending'

-- Success: Payment completed successfully
status = 'success'

-- Failed: Payment failed or cancelled
status = 'failed'
```

## Timing Considerations

1. **OAuth Token:** Valid for ~1 hour, fetched fresh for each payment
2. **Payment Session:** Expires after 30 minutes (1800 seconds)
3. **Webhook:** Usually received within 5-10 seconds of payment
4. **Status Check:** Can verify payment status anytime using Order Status API

## Error Scenarios

### Scenario 1: Payment Abandoned
- User clicks pay
- Gets redirected to PhonePe
- Closes browser/cancels
- **Result:** Purchase remains `pending` (can be cleaned up later)

### Scenario 2: Payment Failed
- User completes payment
- Payment fails (insufficient funds, etc.)
- PhonePe sends webhook with `state: FAILED`
- **Result:** Purchase updated to `failed`

### Scenario 3: Network Issue
- Payment succeeds on PhonePe
- Webhook fails to reach your server
- User redirected via GET callback
- Backend calls Status API to verify
- **Result:** Purchase updated correctly via fallback

## Testing Checklist

- [ ] Course exists in `courses_mux` table
- [ ] User is authenticated
- [ ] Database foreign key constraint removed
- [ ] Environment variables set correctly
- [ ] OAuth token generation works
- [ ] Payment page redirect works
- [ ] Webhook handler processes events
- [ ] Purchase status updates correctly
- [ ] Success/failure pages work

## Monitoring Points

**Check these logs for each payment:**

1. ✅ "PhonePe V2 OAuth Token obtained successfully"
2. ✅ "PhonePe V2 Payment Request: { merchantOrderId, amount, ... }"
3. ✅ "PhonePe V2 Payment Response: { redirectUrl, ... }"
4. ✅ "PhonePe V2 Webhook received: { event, payload }"
5. ✅ "Updating purchase status: { purchaseId, status, event }"

## Quick Debug Commands

```bash
# Check if course exists
SELECT id, title, price FROM courses_mux WHERE id = 'your-course-id';

# Check purchase record
SELECT * FROM purchase WHERE transaction_id = 'ORDER_...';

# Check purchase status
SELECT id, user_id, course_id, amount, status, created_at
FROM purchase
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 5;
```

## Need Help?

1. Check browser console (F12)
2. Check server logs
3. Verify webhook is receiving data (check POST logs)
4. Test with PhonePe sandbox test cards
5. Review `PHONEPE_V2_INTEGRATION.md` for detailed troubleshooting
