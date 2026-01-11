-- HitlAI Platform Infrastructure
-- Multi-tenant platform for companies and human testers

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT, -- startup, small, medium, enterprise
  
  -- Subscription
  plan_type TEXT DEFAULT 'free', -- free, pro, enterprise
  monthly_test_quota INT DEFAULT 10,
  tests_used_this_month INT DEFAULT 0,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Billing
  stripe_customer_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);

-- Company Members Table
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- owner, admin, member, viewer
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);

-- Human Testers Table
CREATE TABLE human_testers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Profile
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  
  -- Demographics (for persona matching)
  age INT,
  tech_literacy TEXT, -- low, medium, high
  primary_device TEXT, -- desktop, mobile, tablet
  location_country TEXT,
  languages TEXT[], -- ['en', 'es', 'fr']
  
  -- Experience
  total_tests_completed INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0.0,
  specialties TEXT[], -- ['e-commerce', 'accessibility', 'mobile']
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  hourly_rate_usd FLOAT, -- Optional: for paid testing
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_human_testers_user ON human_testers(user_id);
CREATE INDEX idx_human_testers_available ON human_testers(is_available) WHERE is_available = TRUE;

-- Test Requests Table (companies request tests)
CREATE TABLE test_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Test details
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  mission TEXT NOT NULL,
  
  -- Test configuration
  test_type TEXT NOT NULL, -- ai_only, human_only, hybrid
  personas JSONB NOT NULL, -- array of persona IDs or configs
  test_dimensions JSONB, -- ['happy_path', 'negative_testing', 'accessibility']
  
  -- Human testing settings
  required_testers INT DEFAULT 0, -- how many human testers needed
  tester_requirements JSONB, -- age range, tech literacy, device, etc.
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, pending, in_progress, completed, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Results
  ai_test_run_ids UUID[],
  human_test_assignment_ids UUID[],
  
  -- Scheduling
  deadline TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_requests_company ON test_requests(company_id);
CREATE INDEX idx_test_requests_status ON test_requests(status);
CREATE INDEX idx_test_requests_created_at ON test_requests(created_at DESC);

-- Human Test Assignments (assign tests to human testers)
CREATE TABLE human_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES human_testers(id) ON DELETE CASCADE,
  
  -- Assignment details
  assigned_persona_id UUID REFERENCES personas(id),
  instructions TEXT,
  
  -- Status
  status TEXT DEFAULT 'assigned', -- assigned, in_progress, completed, rejected
  
  -- Results
  completion_time_seconds INT,
  friction_points_found INT DEFAULT 0,
  sentiment_score FLOAT,
  notes TEXT,
  recording_url TEXT, -- screen recording
  
  -- Feedback
  tester_feedback TEXT,
  company_rating INT, -- 1-5 stars
  company_feedback TEXT,
  
  -- Timestamps
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_human_test_assignments_request ON human_test_assignments(test_request_id);
CREATE INDEX idx_human_test_assignments_tester ON human_test_assignments(tester_id);
CREATE INDEX idx_human_test_assignments_status ON human_test_assignments(status);

-- Persona Images Table (AI-generated persona avatars)
CREATE TABLE persona_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE UNIQUE,
  
  -- Image details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  generation_prompt TEXT,
  
  -- Metadata
  generator TEXT DEFAULT 'dall-e-3', -- dall-e-3, midjourney, stable-diffusion
  style TEXT, -- realistic, illustration, cartoon
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_images_persona ON persona_images(persona_id);

-- Test Results Comparison (AI vs Human)
CREATE TABLE test_result_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_request_id UUID REFERENCES test_requests(id) ON DELETE CASCADE,
  
  -- AI results
  ai_friction_points INT,
  ai_sentiment_score FLOAT,
  ai_completion_time_seconds INT,
  
  -- Human results (aggregated)
  human_friction_points_avg FLOAT,
  human_sentiment_score_avg FLOAT,
  human_completion_time_avg INT,
  human_testers_count INT,
  
  -- Comparison metrics
  agreement_score FLOAT, -- 0.0 to 1.0 (how much AI and humans agree)
  ai_missed_issues INT, -- issues humans found but AI didn't
  human_missed_issues INT, -- issues AI found but humans didn't
  
  -- Learning
  insights JSONB, -- extracted learnings from comparison
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_result_comparisons_request ON test_result_comparisons(test_request_id);

-- Update test_runs to link to test_requests
ALTER TABLE test_runs
ADD COLUMN test_request_id UUID REFERENCES test_requests(id) ON DELETE SET NULL,
ADD COLUMN test_type TEXT DEFAULT 'ai_only', -- ai_only, human_assisted, validation
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX idx_test_runs_test_request ON test_runs(test_request_id);
CREATE INDEX idx_test_runs_company ON test_runs(company_id);

-- Update personas to support AI-generated images and privacy
ALTER TABLE personas
ADD COLUMN image_url TEXT,
ADD COLUMN is_generated_from_human_data BOOLEAN DEFAULT FALSE,
ADD COLUMN privacy_level TEXT DEFAULT 'public', -- public, company_private, fully_anonymized
ADD COLUMN source_session_count INT DEFAULT 0; -- how many human sessions contributed to this persona

-- Row Level Security

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_result_comparisons ENABLE ROW LEVEL SECURITY;

-- Companies Policies
CREATE POLICY "Users can view their companies"
  ON companies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = companies.id
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Company admins can update their company"
  ON companies FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = companies.id
    AND company_members.user_id = auth.uid()
    AND company_members.role IN ('owner', 'admin')
  ));

-- Company Members Policies
CREATE POLICY "Users can view members of their companies"
  ON company_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_members.company_id
    AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Company owners can manage members"
  ON company_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM company_members cm
    WHERE cm.company_id = company_members.company_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'owner'
  ));

-- Human Testers Policies
CREATE POLICY "Testers can view their own profile"
  ON human_testers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Companies can view verified testers"
  ON human_testers FOR SELECT
  USING (is_verified = TRUE);

CREATE POLICY "Users can create tester profile"
  ON human_testers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Testers can update their profile"
  ON human_testers FOR UPDATE
  USING (user_id = auth.uid());

-- Test Requests Policies
CREATE POLICY "Company members can view their test requests"
  ON test_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = test_requests.company_id
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "Company members can create test requests"
  ON test_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = test_requests.company_id
    AND company_members.user_id = auth.uid()
  ));

CREATE POLICY "Company members can update their test requests"
  ON test_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = test_requests.company_id
    AND company_members.user_id = auth.uid()
  ));

-- Human Test Assignments Policies
CREATE POLICY "Testers can view their assignments"
  ON human_test_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM human_testers
    WHERE human_testers.id = human_test_assignments.tester_id
    AND human_testers.user_id = auth.uid()
  ));

CREATE POLICY "Companies can view assignments for their tests"
  ON human_test_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_requests tr
    JOIN company_members cm ON cm.company_id = tr.company_id
    WHERE tr.id = human_test_assignments.test_request_id
    AND cm.user_id = auth.uid()
  ));

CREATE POLICY "System can create assignments"
  ON human_test_assignments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Testers can update their assignments"
  ON human_test_assignments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM human_testers
    WHERE human_testers.id = human_test_assignments.tester_id
    AND human_testers.user_id = auth.uid()
  ));

-- Persona Images Policies
CREATE POLICY "Users can view persona images"
  ON persona_images FOR SELECT
  USING (true);

CREATE POLICY "System can manage persona images"
  ON persona_images FOR ALL
  USING (true);

-- Test Result Comparisons Policies
CREATE POLICY "Company members can view comparisons for their tests"
  ON test_result_comparisons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_requests tr
    JOIN company_members cm ON cm.company_id = tr.company_id
    WHERE tr.id = test_result_comparisons.test_request_id
    AND cm.user_id = auth.uid()
  ));

CREATE POLICY "System can create comparisons"
  ON test_result_comparisons FOR ALL
  USING (true);

-- Functions

-- Function to get available testers matching requirements
CREATE OR REPLACE FUNCTION match_available_testers(
  requirements JSONB,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  tester_id UUID,
  display_name TEXT,
  age INT,
  tech_literacy TEXT,
  average_rating FLOAT,
  total_tests_completed INT,
  match_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ht.id,
    ht.display_name,
    ht.age,
    ht.tech_literacy,
    ht.average_rating,
    ht.total_tests_completed,
    (
      CASE WHEN requirements->>'age_min' IS NOT NULL AND ht.age >= (requirements->>'age_min')::INT THEN 0.3 ELSE 0.0 END +
      CASE WHEN requirements->>'age_max' IS NOT NULL AND ht.age <= (requirements->>'age_max')::INT THEN 0.3 ELSE 0.0 END +
      CASE WHEN requirements->>'tech_literacy' IS NOT NULL AND ht.tech_literacy = requirements->>'tech_literacy' THEN 0.4 ELSE 0.0 END
    ) AS match_score
  FROM human_testers ht
  WHERE ht.is_available = TRUE
    AND ht.is_verified = TRUE
  ORDER BY match_score DESC, ht.average_rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE companies IS 'Companies using HitlAI platform for testing';
COMMENT ON TABLE human_testers IS 'Human testers who execute manual tests';
COMMENT ON TABLE test_requests IS 'Test requests from companies (AI, human, or hybrid)';
COMMENT ON TABLE human_test_assignments IS 'Assignments of tests to human testers';
COMMENT ON TABLE persona_images IS 'AI-generated avatar images for personas';
COMMENT ON TABLE test_result_comparisons IS 'Comparison of AI vs human test results for learning';
