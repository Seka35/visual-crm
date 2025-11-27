-- Add payment type and amount paid fields to deals table

-- Add payment_type column (one-time, monthly, yearly)
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'one-time' 
CHECK (payment_type IN ('one-time', 'monthly', 'yearly'));

-- Add amount_paid column to track how much has been paid
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;

-- Add a comment to explain the columns
COMMENT ON COLUMN public.deals.payment_type IS 'Type of payment: one-time, monthly, or yearly';
COMMENT ON COLUMN public.deals.amount_paid IS 'Amount already paid by the client';
