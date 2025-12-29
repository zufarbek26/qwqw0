-- Add new subject types to the enum
ALTER TYPE subject_type ADD VALUE IF NOT EXISTS 'english';
ALTER TYPE subject_type ADD VALUE IF NOT EXISTS 'russian';