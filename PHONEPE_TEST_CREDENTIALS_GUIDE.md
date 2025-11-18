# PhonePe TEST Credentials Setup Guide

## Issue Summary

You were getting **401 Unauthorized** errors when calling PhonePe sandbox APIs because you were using **PRODUCTION credentials** with **UAT/sandbox endpoints**.

PhonePe support has confirmed: **You MUST use TEST credentials for sandbox/UAT environments.**

---

## How to Get TEST Credentials

### Step 1: Access PhonePe Business Dashboard
1. Go to: https://business.phonepe.com/
2. Login with your merchant account

### Step 2: Switch to TEST Mode
1. Look at the **left panel** of the dashboard
2. Find the toggle switch **above the 'Help' section**
3. **Toggle to TEST mode** (not Production mode)

### Step 3: Navigate to Developer Settings
1. In TEST mode, go to **Developer Settings**
2. You will see your **TEST credentials** (different from production)

### Step 4: Copy TEST Credentials
Copy the following values:
- **Test Client ID** - Different from your production client ID
- **Test Client Secret** - Different from your production secret
- **Test Client Version** - The correct version for your account

### Step 5: Update .env.local
Replace the placeholder values in your `.env.local` file:

```env
PHONEPE_MERCHANT_ID=<YOUR_TEST_MERCHANT_ID>
PHONEPE_CLIENT_ID=<YOUR_TEST_CLIENT_ID>
PHONEPE_CLIENT_SECRET=<YOUR_TEST_CLIENT_SECRET>
PHONEPE_CLIENT_VERSION=<YOUR_TEST_CLIENT_VERSION>
```

---

## Important Notes

### Production vs TEST Credentials
- **Production credentials** = For live transactions on production endpoints
- **TEST credentials** = For sandbox/UAT testing on preprod endpoints
- **These are DIFFERENT sets of credentials!**

### API Endpoints (Already Correct)
The sandbox endpoints in your `.env.local` are correct:
```
https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay
https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order
```

### After Updating Credentials
1. Restart your Next.js development server
2. Test the OAuth token endpoint
3. If successful, test the payment creation flow

---

## Sample API Requests (From PhonePe Support)

### 1. Fetch Auth Token
```bash
curl --location 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=<test client-id>' \
--data-urlencode 'client_version=<test client version>' \
--data-urlencode 'client_secret=<test client-secret>' \
--data-urlencode 'grant_type=client_credentials'
```

### 2. Create Payment
```bash
curl --location 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay' \
--header 'Content-Type: application/json' \
--header 'Authorization: O-Bearer <access-token>' \
--data '{
    "merchantOrderId": "newtxn123456",
    "amount": 1000,
    "expireAfter": 1200,
    "metaInfo": {
        "udf1": "test1",
        "udf2": "new param2",
        "udf3": "test3",
        "udf4": "dummy value 4",
        "udf5": "addition infor ref1"
    },
    "paymentFlow": {
        "type": "PG_CHECKOUT",
        "message": "Payment message used for collect requests",
        "merchantUrls": {
            "redirectUrl": "https://google.com"
        }
    }
}'
```

---

## Current Status

### Your Production Credentials (Saved for Reference)
```
Merchant ID: M234ZMV74TMHZ
Client ID: SU2511131630189756360952
Client Secret: a12a7754-3052-4ae6-9a11-247d7fc5051d
Client Version: 1.0
```

These are saved in `.env.local` as comments. **DO NOT use these for sandbox testing.**

### What You Need to Do
1. Get TEST credentials from dashboard (TEST mode)
2. Replace the placeholder values in `.env.local`
3. Restart your dev server
4. Test the integration

---

## Contact

If you still face issues after using TEST credentials, contact:
**Ishita Chauhan**
PhonePe Integration Team
support@phonepe.com

---

## Additional Resources

- [PhonePe Authorization API](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/authorization)
- [PhonePe Create Payment API](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment)
- [PhonePe Business Dashboard](https://business.phonepe.com/)
