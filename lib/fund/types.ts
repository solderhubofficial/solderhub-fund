export type Member = {
  id: string;
  short_name: string;
  full_name: string | null;
  joined_on: string;
  color: string | null;
  is_admin: boolean;
  user_id: string | null;
};

export type MemberSummary = {
  id: string;
  short_name: string;
  full_name: string | null;
  joined_on: string;
  color: string | null;
  total_contribution: number;
  total_interest_share: number;
  total_loan_disbursed: number;
  total_loan_repaid: number;
  outstanding_loan: number;
  balance: number;
};

export type FundSummary = {
  total_contribution: number;
  total_loan_taken: number;
  total_interest: number;
  fd_balance: number;
  save_others: number;
  max_credit_per_member: number;
  fund_gross_value: number;
  fund_balance: number;
};

export type MonthlyTrendRow = {
  month: string; // date, first-of-month
  contribution: number;
  interest: number;
};

export type LoanTxnType = "disbursement" | "repayment" | "interest";

export type LoanTransaction = {
  id: string;
  member_id: string;
  txn_type: LoanTxnType;
  amount: number;
  txn_date: string;
  note: string | null;
};

export type MonthlyContribution = {
  id: string;
  member_id: string;
  month: string;
  contribution: number;
  interest_share: number;
  paid: boolean;
  note: string | null;
};

export type FdDeposit = {
  id: string;
  amount: number;
  opened_on: string;
  matures_on: string | null;
  status: "active" | "closed";
  note: string | null;
};

export type FundSettings = {
  monthly_contribution: number;
  loan_interest_percent: number;
  max_credit_per_member: number;
};
