import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldX } from "lucide-react";
import { SubscriptionForm } from "./SubscriptionForm";

interface Invoice {
  id: string;
  invoiceName: string;
  total: number;
  status: string;
  fromName: string;
  fromEmail: string;
  date: string;
}

interface Details {
  verified: boolean;
}

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const clientEmail = session.user.email;

  // Fetch invoices only
  const invoiceRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/by-email?clientEmail=${clientEmail}`,
    {
      cache: "no-store",
    }
  );

  const invoices: Invoice[] = await invoiceRes.json();

  // Fetch verified status for each invoice based on fromEmail
  const invoiceWithVerification = await Promise.all(
    invoices.map(async (invoice) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/details/verify?fromEmail=${invoice.fromEmail}`,
          {
            cache: "no-store",
          }
        );

        const data: Details = await res.json();
        return { ...invoice, verified: data.verified };
      } catch (error) {
        console.error(`Failed to verify ${invoice.fromEmail}`, error);
        return { ...invoice, verified: false };
      }
    })
  );

  return (
    <div className="mt-20 space-y-8">
      <SubscriptionForm />
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Your Available Invoices
        </h2>
        {invoiceWithVerification.length === 0 ? (
          <p className="text-center text-gray-500">No invoices found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {invoiceWithVerification.map((invoice) => (
              <Card key={invoice.id} className="relative border">
                <div className="absolute top-3 right-3">
                  {invoice.verified ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-100 border border-green-400 px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-red-600 bg-red-100 border border-red-400 px-2 py-0.5 rounded-full">
                      <ShieldX className="w-4 h-4" />
                      Unverified
                    </span>
                  )}
                </div>

                <CardHeader>
                  <CardTitle>
                    {invoice.invoiceName || "Untitled Invoice"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p>
                    <strong>From:</strong> {invoice.fromName}
                  </p>
                  <p>
                    <strong>From Email:</strong> {invoice.fromEmail}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹{invoice.total.toFixed(2)}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(invoice.date).toLocaleDateString()}
                  </p>

                  {invoice.status === "PAID" ? (
                    <Button
                      disabled
                      className="w-full bg-green-100 text-green-700 cursor-not-allowed"
                    >
                      Paid
                    </Button>
                  ) : !invoice.verified ? (
                    <Button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      Unverified
                    </Button>
                  ) : (
                    <form action={`/dashboard/subscription/${invoice.id}`}>
                      <Button type="submit" className="w-full">
                        View & Pay
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
