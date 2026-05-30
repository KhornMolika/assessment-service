"use client";

import { useState } from "react";
import type { Bank } from "@/src/types/bank.types";
import BankCard from "./BankCard";

export default function BankGridInteractive({ banks }: { banks: Bank[] }) {
  const [bankItems, setBankItems] = useState(banks);

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
