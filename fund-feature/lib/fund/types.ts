export type FundTransactionType = "loan" | "repayment" | "contribution" | "interest";

export interface FundMember {
  id: string;
  name: string;
  slug: string;
  joined_date: string | null;
  active: boolean;
}

export interface FundTransaction {
  id: string;
  member_id: string;
  type: FundTransactionType;
  amount: number;
  txn_date: string; // ISO date
  period: string | null; // ISO date, first-of-month, for contribution/interest rows
  note: string | null;
  created_at: string;
}

export interface MemberBalance {
  member: FundMember;
  totalContribution: number;
  totalInterest: number;
  totalLoanTaken: number;
  totalRepaid: number;
  loanOutstanding: number;
  /** contribution + interest, mirrors this member's slice of "fund gross value" */
  netPosition: number;
}

export interface FundSummary {
  totalContribution: number;
  totalInterest: number;
  totalLoanOutstanding: number;
  fundGrossValue: number; // totalContribution + totalInterest
  fdAmount: number;
  saveAmount: number;
  maxCreditPerMember: number;
  fundBalance: number; // fundGrossValue - totalLoanOutstanding - fdAmount - saveAmount
  members: MemberBalance[];
  memberCount: number;
}

export interface LoanOutstandingPoint {
  month: string; // "YYYY-MM"
  loanOutstanding: number;
}

export interface ActivityItem {
  id: string;
  memberName: string;
  type: FundTransactionType;
  amount: number;
  date: string; // ISO
}

export interface NewTransactionInput {
  member_id: string;
  type: FundTransactionType;
  amount: number;
  txn_date: string;
  period?: string | null;
  note?: string | null;
}
