import type { BankVisibility } from "./api";

export interface NewQuestionBankFormData {
  name: string;
  description: string;
  tags: string;
  visibility: BankVisibility;
  ownerTopicId: string;
}

export interface EditQuestionBankFormData {
  name: string;
  description: string;
  tags: string;
  visibility: BankVisibility;
  ownerTopicId: string;
}
