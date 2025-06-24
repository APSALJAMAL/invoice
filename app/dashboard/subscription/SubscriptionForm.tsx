// SubscriptionForm.tsx (client)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SubscriptionForm() {
  const [invoiceId, setInvoiceId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceId.trim()) {
      router.push(`/dashboard/subscription/${invoiceId}`);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-center">Enter Invoice ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="Invoice ID"
              required
            />
            <Button type="submit" className="w-full">
              Go to Payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
