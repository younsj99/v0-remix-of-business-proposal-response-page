-- Create activity_log table for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all activity logs
CREATE POLICY "Allow authenticated users to read activity logs"
  ON activity_log FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert activity logs
CREATE POLICY "Allow authenticated users to insert activity logs"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_candidate_id ON activity_log(candidate_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON activity_log(action_type);
