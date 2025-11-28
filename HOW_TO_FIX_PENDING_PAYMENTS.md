# How to Fix Pending Payments - Quick Guide

## The Problem
Payments are completing on PhonePe, but the `purchase` table status is staying "pending" instead of updating to "success".

## Why This Happens
The PhonePe callback wasn't correctly parsing all the different status formats that PhonePe V2 API returns. We've now fixed this.

## ✅ What's Been Fixed

### 1. **Automatic Fix for Future Payments**
All new payments will now automatically update correctly because:
- ✅ Callback handler now checks all PhonePe status formats (`COMPLETED`, `SUCCESS`, `PAYMENT_SUCCESS`, etc.)
- ✅ Payment success page now verifies status when loaded
- ✅ Webhook handler updated with comprehensive status mapping

### 2. **Manual Fix for Existing Pending Payments**
We've created tools to fix payments that are already stuck in "pending" status.

---

## 🔧 Fix Existing Pending Payments

### Option 1: Use the Web Interface (Easiest)

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the fix tool in your browser**:
   ```
   http://localhost:3000/fix-pending-payments.html
   ```

3. **Get pending transaction IDs from Supabase**:
   - Go to your Supabase dashboard
   - Open the `purchase` table
   - Filter: `status = 'pending'`
   - Copy all the `transaction_id` values

4. **Paste and verify**:
   - Paste all transaction IDs into the textarea (one per line)
   - Click "Verify All Payments"
   - The tool will check each one with PhonePe and update the status

5. **Check results**:
   - ✅ Green = Payment was successful, status updated to "success"
   - ⏳ Yellow = Payment still pending on PhonePe
   - ❌ Red = Error (transaction not found or API error)

### Option 2: Manual API Calls

If you prefer to check individual transactions:

```bash
# Replace ORDER_xxx with actual transaction ID
curl "http://localhost:3000/api/phonepe/verify-pending?transactionId=ORDER_xxx"
```

Or open in browser:
```
http://localhost:3000/api/phonepe/verify-pending?transactionId=ORDER_xxx
```

**Example Response:**
```json
{
  "success": true,
  "transactionId": "ORDER_xxx",
  "previousStatus": "pending",
  "currentStatus": "success",
  "message": "Payment verified and status updated to success!"
}
```

### Option 3: Batch Script (For Many Transactions)

If you have many pending transactions, you can use this Node.js script:

```javascript
// fix-pending.js
const transactionIds = [
  "ORDER_0642922941_3ED7BB34",
  "ORDER_0642902327_37660F75",
  "ORDER_0642833407_723A9F8E",
  // ... add all your pending transaction IDs
];

async function fixAll() {
  for (const txId of transactionIds) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/phonepe/verify-pending?transactionId=${txId}`
      );
      const result = await response.json();
      console.log(`${txId}: ${result.previousStatus} → ${result.currentStatus}`);
    } catch (error) {
      console.error(`${txId}: ERROR -`, error.message);
    }
  }
}

fixAll();
```

Run it:
```bash
node fix-pending.js
```

---

## 📊 Check Results in Supabase

After running the fix:

1. Go to Supabase dashboard
2. Open the `purchase` table
3. Check the `status` column:
   - Should now show "success" for completed payments
   - `payment_response` column should contain PhonePe's response data

---

## 🧪 Test with New Payment

1. **Make a test payment**:
   - Go to any course page
   - Click purchase/pay button
   - Complete payment on PhonePe sandbox

2. **Check the status updates automatically**:
   - Open browser console (F12)
   - You should see logs like:
     ```
     Checking payment status for order: ORDER_xxx
     Extracted state: COMPLETED code: PAYMENT_SUCCESS
     Updating purchase status to: success
     Successfully updated purchase status to: success
     ```

3. **Verify in database**:
   - Check `purchase` table
   - Status should be "success" ✅
   - `payment_response` should have PhonePe data

---

## 🚀 For Production

When deploying to production:

1. **The fixes are already in place** - no additional changes needed

2. **Optional: Configure PhonePe Webhooks** (for extra reliability):
   - Login to PhonePe Merchant Dashboard
   - Go to Webhooks/Notifications
   - Add webhook URL: `https://maathiyosi.io/api/phonepe/webhook`
   - Enable events: Payment Success, Payment Failed, Payment Pending

3. **The payment success page will still verify status** even if webhooks aren't configured

---

## 📁 Files Modified

1. ✅ [src/app/api/phonepe/callback/route.ts](src/app/api/phonepe/callback/route.ts) - Fixed status detection
2. ✅ [src/app/api/phonepe/webhook/route.ts](src/app/api/phonepe/webhook/route.ts) - Enhanced status mapping
3. ✅ [src/app/payment-success/page.tsx](src/app/payment-success/page.tsx) - Added auto-verification
4. ✨ [src/app/api/phonepe/verify-pending/route.ts](src/app/api/phonepe/verify-pending/route.ts) - NEW: Manual verification API
5. ✨ [public/fix-pending-payments.html](public/fix-pending-payments.html) - NEW: Web interface for bulk fixing

---

## 🎯 Quick Action Steps

**Right now, to fix your pending payments:**

1. Run: `npm run dev`
2. Open: `http://localhost:3000/fix-pending-payments.html`
3. Copy pending transaction IDs from Supabase
4. Paste into the tool
5. Click "Verify All Payments"
6. Done! ✅

---

## ❓ Troubleshooting

**If verification fails:**
- Check that PhonePe credentials in `.env.local` are correct
- Make sure dev server is running
- Check browser console for error messages
- Verify the transaction ID is exactly as shown in database

**If status is still "pending" after verification:**
- The payment might actually still be pending on PhonePe's side
- Check PhonePe merchant dashboard to confirm payment status
- If PhonePe shows completed but our system shows pending, there may be an API communication issue

**Need help?**
Check the detailed documentation in [PHONEPE_STATUS_FIX.md](PHONEPE_STATUS_FIX.md)

---

## ✅ Summary

- ✅ **Future payments**: Will update automatically
- ✅ **Existing pending payments**: Use the fix tool
- ✅ **Production ready**: All fixes are in place
- ✅ **No data loss**: All payment data is preserved

You're all set! 🎉
