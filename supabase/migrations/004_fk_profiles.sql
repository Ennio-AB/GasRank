-- Link reviews, prices, receipts to profiles for join queries in feed
ALTER TABLE reviews  ADD CONSTRAINT reviews_user_profile  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE prices   ADD CONSTRAINT prices_user_profile   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE receipts ADD CONSTRAINT receipts_user_profile FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
