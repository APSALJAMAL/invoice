"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PayButton from "@/app/components/PayButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon } from "lucide-react";
import { useTransition } from "react";
import { Invoice, InvoiceItem } from "@prisma/client";

type InvoiceWithExtras = Invoice & {
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  totalWithGST: number;
  dueInDays: number;
};

type Props = {
  invoice: InvoiceWithExtras;
};

function PaidDownloadButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    startTransition(() => {
      window.open(`/api/invoice/${invoiceId}`, "_blank");
    });
  };

  return (
    <Button onClick={handleDownload} disabled={isPending}>
      <DownloadIcon className="w-4 h-4 mr-2" />
      {isPending ? "Downloading..." : "Download Invoice"}
    </Button>
  );
}

export default function InvoiceClientView({ invoice }: Props) {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top section: Back button */}
      <div className="flex justify-between mb-2">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">{invoice.invoiceName}</CardTitle>
            <p className="text-sm text-muted-foreground">Invoice ID: {invoice.id}</p>
            <p className="text-sm text-muted-foreground">
              Invoice Number: #{invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <Badge
              variant={invoice.status === "PAID" ? "default" : "secondary"}
              className="uppercase px-3 py-1 text-sm"
            >
              {invoice.status}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Date: {format(new Date(invoice.date), "PPP")}
            </p>
            <p className="text-sm text-muted-foreground">Due in: {invoice.dueInDays} days</p>
          </div>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8 mb-4">
          <div>
            <h4 className="font-semibold mb-1">From</h4>
            <p>{invoice.fromName}</p>
            <p>{invoice.fromEmail}</p>
            <p>{invoice.fromAddress}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Bill To</h4>
            <p>{invoice.clientName}</p>
            <p>{invoice.clientEmail}</p>
            <p>{invoice.clientAddress}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {invoice.currency} {item.rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {invoice.currency} {(item.quantity * item.rate).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  GST (18%)
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {invoice.currency} {invoice.gstAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold text-lg">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {invoice.currency} {invoice.totalWithGST.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.note && (
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{invoice.note}</p>
          </CardContent>
        </Card>
      )}

      {/* Bottom right button */}
      <div className="flex justify-end pt-4">
        {invoice.status === "PENDING" ? (
          <PayButton invoiceId={invoice.id} />
        ) : (
          <PaidDownloadButton invoiceId={invoice.id} />
        )}
      </div>
    </div>
  );
}
