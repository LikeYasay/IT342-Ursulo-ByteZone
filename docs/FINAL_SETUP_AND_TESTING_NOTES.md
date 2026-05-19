# ByteZone Final Setup and Testing Notes

## 1. Project Scope Reminder

This project currently focuses on:

- Web frontend
- Backend
- Supabase PostgreSQL database

Mobile app development is not included yet.

## 2. Required Database Notes

Because the project uses sandbox payment flow, the database must allow the following payment methods and statuses.

Run this in Supabase SQL Editor if the database still has old constraints:

```sql
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
ADD CONSTRAINT orders_payment_method_check
CHECK (payment_method IN ('CASH', 'QR', 'SANDBOX'));

ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_method_check;

ALTER TABLE payments
ADD CONSTRAINT payments_method_check
CHECK (method IN ('CASH', 'QR', 'SANDBOX'));

ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments
ADD CONSTRAINT payments_status_check
CHECK (status IN ('INITIATED', 'PROCESSING', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'));