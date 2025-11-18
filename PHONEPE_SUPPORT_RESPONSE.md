# Response to PhonePe Support - API Request Details

Hi Ishita,

Thank you for your response. Here are the details you requested:

---

## 1. OAuth Token Request (Getting 401 Error)

**API Host:**
```
https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token
```

**HTTP Method:** `POST`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Request Body (URL-encoded form data):**
```
grant_type=client_credentials&client_id=SU2511131630189756360952&client_secret=a12a7754-3052-4ae6-9a11-247d7fc5051d&client_version=1.0
```

**Error Response:**
```json
{
  "success": false,
  "code": "401"
}
```

**Status Code:** `401 Unauthorized`

---

## 2. Create Payment Request (Will be called after OAuth succeeds)

**API Host:**
```
https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay
```

**HTTP Method:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: O-Bearer {access_token}
Accept: application/json
```

**Request Payload (Sample):**
```json
{
  "merchantOrderId": "ORDER_1734448731_A1B2C3D4",
  "amount": 49900,
  "paymentFlow": {
    "type": "PG_CHECKOUT",
    "merchantUrls": {
      "redirectUrl": "https://maathiyosi.io/api/phonepe/callback"
    }
  },
  "expireAfter": 1800,
  "metaInfo": {
    "udf1": "course-id-here",
    "udf2": "Course Title",
    "udf3": "purchase-id"
  }
}
```

---

## 3. My Credentials

**Merchant ID:** `M234ZMV74TMHZ`
**Client ID:** `SU2511131630189756360952`
**Client Secret:** `a12a7754-3052-4ae6-9a11-247d7fc5051d`
**Environment:** Sandbox
**KYC Status:** Completed

---

## 4. Questions

1. **What is my correct `client_version` value?**
   - I'm currently using `1.0` but getting 401 error
   - Is this the correct value for my merchant account?

2. **Are my V2 API credentials activated for sandbox?**
   - KYC is complete
   - Need confirmation that V2 API access is enabled

3. **Is there any additional activation required?**
   - Domain whitelisting?
   - IP whitelisting?
   - Sandbox environment activation?

---

## 5. Integration Details

**Implementation:** Website integration using V2 Standard Checkout API
**Framework:** Next.js (Node.js)
**Callback URL:** `https://maathiyosi.io/api/phonepe/callback`
**Documentation Followed:**
- https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/authorization
- https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment

---

## 6. Timeline of Events

1. Initially tried V1 API (with salt key) - got "KEY_NOT_CONFIGURED" error
2. PhonePe support advised to switch to V2 API (client_id/client_secret)
3. Migrated entire codebase to V2 API
4. Now getting 401 Unauthorized on OAuth token endpoint
5. All code follows V2 documentation exactly

---

## 7. What I Need

Please help with:
1. ✅ Verify my credentials are correct
2. ✅ Provide the correct `client_version` value for my account
3. ✅ Activate V2 API access for sandbox (if not already active)
4. ✅ Confirm if any additional configuration is needed

---

Thank you for your assistance!

Best regards,
[Your Name]
Merchant ID: M234ZMV74TMHZ
