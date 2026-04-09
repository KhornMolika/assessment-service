import type { BankVisibility } from "./bank.types";

export interface NewQuestionBankFormData {
  name: string;
  description: string;
  tags: string;
  visibility: BankVisibility;
}

export interface EditQuestionBankFormData {
  name: string;
  description: string;
  tags: string;
  visibility: BankVisibility;
}
