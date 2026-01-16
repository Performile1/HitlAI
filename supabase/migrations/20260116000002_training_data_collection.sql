-- Migration: Training Data Collection System
-- Purpose: Capture test data for AI model fine-tuning

-- Create ai_training_data table
CREATE TABLE IF NOT EXISTS ai_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Input data
  input_data JSONB NOT NULL,
  
  -- AI output data
  ai_output JSONB NOT NULL,
  
  -- Human feedback/labels (if available)
  human_labels JSONB,
  
  -- Quality indicators
  is_high_quality BOOLEAN DEFAULT FALSE,
  human_verified BOOLEAN DEFAULT FALSE,
  company_rating INTEGER CHECK (company_rating >= 1 AND company_rating <= 5),
  
  -- Training usage
  used_for_training BOOLEAN DEFAULT FALSE,
  training_batch_id UUID,
  
  -- Metadata
  model_version TEXT,
  test_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_models table (track deployed models)
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL CHECK (model_type IN ('fine-tuned', 'self-hosted', 'external')),
  base_model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'groq', 'self-hosted')),
  
  -- Model identifiers
  model_id TEXT,
  endpoint_url TEXT,
  
  -- Training info
  training_batch_id UUID,
  trained_on_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  accuracy_score DECIMAL(5,2),
  cost_per_1k_tokens DECIMAL(10,6),
  
  -- Status
  status TEXT DEFAULT 'training' CHECK (status IN ('training', 'deployed', 'deprecated', 'failed')),
  deployed_at TIMESTAMPTZ,
  
  -- Metadata
  phase TEXT CHECK (phase IN ('phase1', 'phase2', 'phase3', 'phase4')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training_batches table
CREATE TABLE IF NOT EXISTS training_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  
  -- Training data
  training_data_count INTEGER DEFAULT 0,
  training_file_path TEXT,
  openai_file_id TEXT,
  
  -- Fine-tuning job
  fine_tune_job_id TEXT,
  fine_tune_status TEXT DEFAULT 'pending' CHECK (fine_tune_status IN ('pending', 'uploading', 'training', 'completed', 'failed')),
  
  -- Results
  resulting_model_id UUID REFERENCES ai_models(id),
  training_cost DECIMAL(10,2),
  
  -- Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add training_batch_id foreign key to ai_training_data
ALTER TABLE ai_training_data 
ADD CONSTRAINT fk_training_batch 
FOREIGN KEY (training_batch_id) 
REFERENCES training_batches(id) 
ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_training_data_test_run ON ai_training_data(test_run_id);
CREATE INDEX idx_training_data_tester ON ai_training_data(tester_id);
CREATE INDEX idx_training_data_quality ON ai_training_data(is_high_quality, human_verified);
CREATE INDEX idx_training_data_unused ON ai_training_data(used_for_training) WHERE used_for_training = FALSE;
CREATE INDEX idx_training_data_created ON ai_training_data(created_at DESC);

CREATE INDEX idx_models_status ON ai_models(status);
CREATE INDEX idx_models_phase ON ai_models(phase);

CREATE INDEX idx_batches_status ON training_batches(fine_tune_status);

-- Function to mark training data as high quality
CREATE OR REPLACE FUNCTION mark_high_quality_training_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as high quality if company rating is 4+
  IF NEW.company_rating >= 4 THEN
    NEW.is_high_quality := TRUE;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-mark high quality data
CREATE TRIGGER before_training_data_insert
  BEFORE INSERT OR UPDATE ON ai_training_data
  FOR EACH ROW
  EXECUTE FUNCTION mark_high_quality_training_data();

-- Function to get training data stats
CREATE OR REPLACE FUNCTION get_training_data_stats()
RETURNS TABLE (
  total_count BIGINT,
  high_quality_count BIGINT,
  human_verified_count BIGINT,
  unused_count BIGINT,
  ready_for_training BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_count,
    COUNT(*) FILTER (WHERE is_high_quality = TRUE)::BIGINT as high_quality_count,
    COUNT(*) FILTER (WHERE human_verified = TRUE)::BIGINT as human_verified_count,
    COUNT(*) FILTER (WHERE used_for_training = FALSE)::BIGINT as unused_count,
    COUNT(*) FILTER (WHERE is_high_quality = TRUE AND human_verified = TRUE AND used_for_training = FALSE)::BIGINT as ready_for_training
  FROM ai_training_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update milestone for human verified tests
CREATE OR REPLACE FUNCTION update_training_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Update human verified milestone
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM ai_training_data 
    WHERE human_verified = TRUE
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Human Verified Tests';
  
  -- Update training batch ready milestone
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM ai_training_data 
    WHERE is_high_quality = TRUE 
    AND human_verified = TRUE 
    AND used_for_training = FALSE
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Training Batch Ready';
  
  -- Update fine-tuned models deployed milestone
  UPDATE platform_milestones
  SET current_value = (
    SELECT COUNT(*) 
    FROM ai_models 
    WHERE status = 'deployed' 
    AND model_type = 'fine-tuned'
  ),
  updated_at = NOW()
  WHERE milestone_name = 'Fine-Tuned Models Deployed';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update training milestones
CREATE TRIGGER after_training_data_change
  AFTER INSERT OR UPDATE ON ai_training_data
  FOR EACH ROW
  EXECUTE FUNCTION update_training_milestones();

CREATE TRIGGER after_model_change
  AFTER INSERT OR UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_training_milestones();

-- Enable RLS
ALTER TABLE ai_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_training_data
CREATE POLICY "Service role can manage training data"
  ON ai_training_data
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Testers can view their training data"
  ON ai_training_data
  FOR SELECT
  USING (tester_id = auth.uid());

CREATE POLICY "Companies can view their training data"
  ON ai_training_data
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for ai_models
CREATE POLICY "Anyone can view deployed models"
  ON ai_models
  FOR SELECT
  USING (status = 'deployed');

CREATE POLICY "Service role can manage models"
  ON ai_models
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for training_batches
CREATE POLICY "Service role can manage batches"
  ON training_batches
  FOR ALL
  USING (auth.role() = 'service_role');

-- View for training data summary
CREATE OR REPLACE VIEW training_data_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_high_quality = TRUE) as high_quality_count,
  COUNT(*) FILTER (WHERE human_verified = TRUE) as verified_count,
  COUNT(*) FILTER (WHERE used_for_training = TRUE) as used_count
FROM ai_training_data
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
