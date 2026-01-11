interface PayoutParams {
  baseFee: number;
  testerTrustScore: number;
  isDisputeAudit: boolean;
  didOverruleAI: boolean;
  agreementRate: number;
}

interface PayoutResult {
  finalAmount: number;
  breakdown: {
    trustBonus: string;
    truthIncentive: string;
    penaltyApplied: boolean;
  };
}

export const calculateTesterPayout = ({
  baseFee,
  testerTrustScore,
  isDisputeAudit,
  didOverruleAI,
  agreementRate
}: PayoutParams): PayoutResult => {
  const trustMultiplier = 1 + (testerTrustScore / 2000);
  
  let disputeBonus = 0;
  if (isDisputeAudit && didOverruleAI && agreementRate > 0.66) {
    disputeBonus = baseFee * 0.5;
  }
  
  let qualityPenalty = 1.0;
  if (agreementRate < 0.33) {
    qualityPenalty = 0.5;
  }
  
  const finalPayout = (baseFee * trustMultiplier * qualityPenalty) + disputeBonus;
  
  return {
    finalAmount: parseFloat(finalPayout.toFixed(2)),
    breakdown: {
      trustBonus: (baseFee * (trustMultiplier - 1)).toFixed(2),
      truthIncentive: disputeBonus.toFixed(2),
      penaltyApplied: qualityPenalty < 1.0
    }
  };
};
