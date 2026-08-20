# Database Setup (PostgreSQL)

Maison Aurelia uses PostgreSQL as the authoritative, production database. 

## Initialization

The schema is defined in `/backend/src/db/schema.sql`.

To initialize the database locally or in production:

1. Create a new PostgreSQL database.
2. Obtain the connection string (e.g., \`postgres://postgres:password@localhost:5432/aurelia\`).
3. Set the \`DATABASE_URL\` environment variable in `/backend/.env`.
4. Run the schema creation script.

### Running Schema Scripts (CLI)
Using `psql`:

```bash
psql $DATABASE_URL -f backend/src/db/schema.sql
```

### Seeding Initial Data
You can seed initial master catalogue products and admin users:

```bash
psql $DATABASE_URL -f backend/src/db/seed.sql
```

## Schema Highlights

* **Users**: Stores patrons and atelier staff with role-based access (`customer`, `admin`, `master_jeweller`, etc.).
* **Products**: The authoritative jewellery catalogue, including materials, purity, stock, and pricing.
* **Orders**: Tracks acquisitions, payment intents, and fulfilment status.
* **Bespoke Inquiries**: Stores custom design dossier requests.
* **Conversations**: Atelier staff-to-patron messaging.

## Production Considerations
* **Connection Pooling**: The application uses the `pg` driver with connection pooling. Ensure your database is configured to handle max connections (e.g., using PgBouncer).
* **Migrations**: In a continuous production environment, replace direct `.sql` execution with a migration tool like Flyway, Liquibase, or TypeORM/Prisma migrations.
