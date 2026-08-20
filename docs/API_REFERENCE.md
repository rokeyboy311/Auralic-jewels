# API Reference

The backend Express application exposes the following RESTful routes:

## Public Routes

### Products
* `GET /api/products` - Fetch catalogue (supports `category`, `search`, `limit`, `sort`).
* `GET /api/products/:id` - Fetch single product by ID or Slug.
* `GET /api/categories` - Fetch active categories.
* `GET /api/collections` - Fetch active collections.

### Authentication
* `POST /api/auth/register` - Create patron account. Returns JWT.
* `POST /api/auth/login` - Authenticate patron/staff. Returns JWT.
* `POST /api/auth/google` - Authenticate via Google OAuth. Returns JWT.
* `POST /api/auth/logout` - Clears HttpOnly cookie.

### Orders & Checkout
* `POST /api/stripe/intent` - Create Stripe PaymentIntent.
* `POST /api/orders` - Submit final order payload.
* `POST /api/orders/track` - Track order status (requires email/order number).
* `POST /api/coupons/validate` - Validate promotion codes.
* `GET /api/shipping` - Get available shipping methods.

### Custom Bespoke
* `POST /api/bespoke` - Submit custom design/modification dossier.

## Protected Routes (Requires Authentication)

* `GET /api/auth/me` - Get current authenticated profile.
* `GET /api/orders/:id` - Get order details (must belong to user).
* `GET /api/bespoke` - Get user's bespoke requests.

## Admin Routes (Requires Staff/Admin Roles)

### Dashboard
* `GET /api/admin/stats` - Key metrics (revenue, active orders, etc.).

### Inventory Management
* `POST /api/admin/products` - Create/Update product.
* `DELETE /api/admin/products/:id` - Archive/Delete product.

### Order Fulfillment
* `GET /api/admin/orders` - View all orders.
* `PUT /api/admin/orders/:id/status` - Update order tracking and status.

### Client Conversations
* `GET /api/conversations` - List patron messages.
* `GET /api/conversations/:id` - View conversation thread.
* `POST /api/conversations/:id/messages` - Reply to patron.
* `PATCH /api/conversations/:id` - Update conversation status/assignment.
