-- Script to update CHECK constraint for discountType in Promotions table
-- Run this in SQL Server Management Studio or similar tool

-- First, drop the existing constraint (if it exists)
-- Note: Replace 'CK__Promotion__disco__4E53A1AA' with the actual constraint name if different
ALTER TABLE Promotions DROP CONSTRAINT IF EXISTS CK__Promotion__disco__4E53A1AA;

-- Or if you know the constraint name from your script, drop it
-- ALTER TABLE [dbo].[Promotions] DROP CONSTRAINT [your_constraint_name];

-- Then, add the new constraint allowing 'percent' and 'amount'
ALTER TABLE [dbo].[Promotions] WITH CHECK ADD CHECK (([discountType]='percent' OR [discountType]='amount'));

-- Optional: Update any existing data if needed
-- UPDATE Promotions SET discountType = 'percent' WHERE discountType = 'percent';
-- UPDATE Promotions SET discountType = 'amount' WHERE discountType = 'amount';