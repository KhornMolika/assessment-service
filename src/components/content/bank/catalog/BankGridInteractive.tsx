"use client";

import { useState, useEffect } from "react";
import type { QuestionBank } from "@/src/types/api";
import BankCard from "./BankCard";

export default function BankGridInteractive({ banks }: { banks: QuestionBank[] }) {
  const [bankItems, setBankItems] = useState(banks);

  useEffect(() => {
    setBankItems(banks);
  }, [banks]);

  const handleDeleteBank = (bankId: string) => {
    setBankItems((current) => current.filter((bank) => bank.id !== bankId));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {bankItems.map((bank) => (
        <BankCard key={bank.id} bank={bank} onDelete={handleDeleteBank} />
      ))}
    </div>
  );
}
