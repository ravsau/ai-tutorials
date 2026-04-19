-- Enable RLS on your table
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users see own data" ON your_table
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own rows
CREATE POLICY "Users insert own data" ON your_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own rows
CREATE POLICY "Users update own data" ON your_table
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own rows
CREATE POLICY "Users delete own data" ON your_table
  FOR DELETE USING (auth.uid() = user_id);
