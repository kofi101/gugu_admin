'use client';

import React, { useState } from 'react';
import { MerchantCard } from './merchant-card';
import { Merchant } from './merchants';
import { Input } from '@/components/ui/input';

export function PendingMerchant({ merchants }: { merchants: Array<Merchant> }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMerchants = merchants.filter((merchant) =>
    merchant.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search merchants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border p-2"
        />
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredMerchants?.length > 0 ? (
          filteredMerchants?.map((merchant) => (
            <MerchantCard merchant={merchant} key={merchant.email} />
          ))
        ) : (
          <p className="text-gray-500">No merchants found</p>
        )}
      </div>
    </div>
  );
}
