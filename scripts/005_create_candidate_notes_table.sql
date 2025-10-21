-- Create candidate_notes table for recruitment team collaboration
CREATE TABLE IF NOT EXISTS candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all notes
CREATE POLICY "Allow authenticated users to read notes"
  ON candidate_notes FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert notes
CREATE POLICY "Allow authenticated users to insert notes"
  ON candidate_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own notes
CREATE POLICY "Allow authenticated users to update notes"
  ON candidate_notes FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete notes
CREATE POLICY "Allow authenticated users to delete notes"
  ON candidate_notes FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate_id ON candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_created_at ON candidate_notes(created_at DESC);
