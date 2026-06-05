-- Product indexes
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");
CREATE INDEX IF NOT EXISTS "Product_isSale_idx" ON "Product"("isSale");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");

-- Order indexes
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_orderStatus_idx" ON "Order"("orderStatus");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
