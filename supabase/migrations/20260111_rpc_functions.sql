-- RPC Functions for Confidence Guarantee Dispute System
-- Phase 1: Durable Foundation - Complete Vertical Slice

-- Function: Add credits to company account
CREATE OR REPLACE FUNCTION add_credits(
  p_company_id UUID,
  p_amount INT
) RETURNS VOID AS $$
BEGIN
  -- Update balance
  UPDATE company_credits
  SET balance = balance + p_amount,
      total_purchased = total_purchased + p_amount
  WHERE company_id = p_company_id;
  
  -- Create transaction record
  INSERT INTO credit_transactions (company_id, amount, type)
  VALUES (p_company_id, p_amount, 'purchase');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Charge dispute penalty when AI is upheld
CREATE OR REPLACE FUNCTION charge_dispute_penalty(
  p_company_id UUID,
  p_credits INT,
  p_penalty DECIMAL
) RETURNS VOID AS $$
DECLARE
  v_penalty_credits INT;
BEGIN
  -- Convert penalty dollars to credits ($1.50 per credit)
  v_penalty_credits := CEIL(p_penalty / 1.5);
  
  -- Deduct escrowed credits from conditional balance
  UPDATE company_credits
  SET conditional_balance = conditional_balance - p_credits,
      balance = balance - v_penalty_credits,
      total_spent = total_spent + p_credits + v_penalty_credits
  WHERE company_id = p_company_id;
  
  -- Record transactions
  INSERT INTO credit_transactions (company_id, amount, type, description)
  VALUES 
    (p_company_id, -p_credits, 'dispute_charge', 'Validation credits charged - AI upheld'),
    (p_company_id, -v_penalty_credits, 'penalty', 'False dispute penalty');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Refund dispute when AI is overruled
CREATE OR REPLACE FUNCTION refund_dispute(
  p_company_id UUID,
  p_dispute_id UUID
) RETURNS VOID AS $$
DECLARE
  v_credits INT;
BEGIN
  -- Get escrowed credits
  SELECT conditional_credits_granted INTO v_credits
  FROM disputes
  WHERE id = p_dispute_id;
  
  -- Release from escrow (credits stay with company for free)
  UPDATE company_credits
  SET conditional_balance = conditional_balance - v_credits
  WHERE company_id = p_company_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (company_id, amount, type, description)
  VALUES (p_company_id, 0, 'dispute_refund', 'AI overruled - Human report provided free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Initialize dispute with escrow
CREATE OR REPLACE FUNCTION create_dispute_with_escrow(
  p_test_id UUID,
  p_company_id UUID,
  p_reason TEXT,
  p_credits INT DEFAULT 10
) RETURNS UUID AS $$
DECLARE
  v_dispute_id UUID;
BEGIN
  -- Create dispute
  INSERT INTO disputes (test_id, company_id, reason, conditional_credits_granted, status)
  VALUES (p_test_id, p_company_id, p_reason, p_credits, 'pending')
  RETURNING id INTO v_dispute_id;
  
  -- Move credits to escrow
  UPDATE company_credits
  SET conditional_balance = conditional_balance + p_credits
  WHERE company_id = p_company_id;
  
  RETURN v_dispute_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if company has sufficient credits
CREATE OR REPLACE FUNCTION has_sufficient_credits(
  p_company_id UUID,
  p_required_credits INT
) RETURNS BOOLEAN AS $$
DECLARE
  v_available INT;
BEGIN
  SELECT balance - conditional_balance INTO v_available
  FROM company_credits
  WHERE company_id = p_company_id;
  
  RETURN v_available >= p_required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION charge_dispute_penalty TO authenticated;
GRANT EXECUTE ON FUNCTION refund_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION create_dispute_with_escrow TO authenticated;
GRANT EXECUTE ON FUNCTION has_sufficient_credits TO authenticated;
