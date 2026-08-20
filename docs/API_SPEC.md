# REST API SPECIFICATIONS & ENDPOINT CONTRACTS

Base URL in development: `http://localhost:5000/api`  
Base URL in production: `https://auralic-jewels.onrender.com/api`

---

## 1. System Health
- **`GET /health`**
  - Response: `{ status: "healthy", service: "Maison Auralic High Jewellery REST API", uptime: 1204, timestamp: "2026-08-19T..." }`

---

## 2. Products & Catalogue
- **`GET /products`**
  - Query parameters: `category`, `collection`, `minPrice`, `maxPrice`, `sort`, `search`
  - Response: `{ success: true, data: Product[], total: 24 }`

- **`GET /products/:slug`**
  - Params: `slug` (string)
  - Response: `{ success: true, data: Product }`

- **`GET /categories`**
  - Response: `{ success: true, data: Category[] }`

- **`GET /collections`**
  - Response: `{ success: true, data: Collection[] }`

---

## 3. Payments & Checkout
- **`POST /payments/create-intent`**
  - Body: `{ amount: number, currency: string, orderId: string, customerEmail: string }`
  - Response: `{ success: true, data: { clientSecret: string, paymentIntentId: string } }`

- **`POST /payments/webhook`**
  - Raw payload processed with Stripe signature validation.

---

## 4. Bespoke Haute Joaillerie Inquiries
- **`POST /bespoke`**
  - Body:
    ```json
    {
      "clientName": "Lady Eleanor Vance",
      "email": "eleanor.vance@mayfair.co.uk",
      "phone": "+44 20 7946 0912",
      "category": "High Jewellery Necklace",
      "metalPreference": "Solid 950 Platinum & 18K Yellow Gold",
      "estimatedBudget": "USD $35,000 - $75,000",
      "designBrief": "Art Deco emerald and diamond pendant collar inspired by 1920s Paris."
    }
    ```
  - Response: `{ success: true, message: "Private bespoke inquiry logged with the Master Jeweller.", ticketNumber: "AUR-BESPOKE-849201" }`
