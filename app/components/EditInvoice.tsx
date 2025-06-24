"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, Trash } from "lucide-react";
import { useActionState, useState } from "react";
import { SubmitButton } from "./SubmitButtons";
import { editInvoice } from "../actions"; // Updated to editInvoice
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema } from "../utils/zodSchemas";
import { formatCurrency } from "../utils/formatCurrency";

interface Item {
  description: string;
  quantity: string;
  rate: string;
}

interface InvoiceData {
  id: string;
  invoiceName: string;
  invoiceNumber: string;
  currency: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  dueDate: string;
  items: Item[];
  note: string;
  total: string;
}


export function EditInvoice({
  invoice,
}: {
  invoice: InvoiceData;
}) {
  const [lastResult, action] = useActionState(editInvoice, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      if (!formData.get("items")) {
        formData.set("items", JSON.stringify(items));
      }
      formData.set("id", invoice.id); // ensure the invoice id is sent
      return parseWithZod(formData, {
        schema: invoiceSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date(invoice.date)
  );
  const [currency, setCurrency] = useState(invoice.currency);
  const [items, setItems] = useState<Item[]>(invoice.items);

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: "", rate: "" }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const getItemAmount = (item: Item) =>
    (Number(item.quantity) || 0) * (Number(item.rate) || 0);

  const gstRate = 0.18;
  const cgstRate = gstRate / 2;
  const sgstRate = cgstRate;

  const calculateTotal = items.reduce(
    (acc, item) => acc + getItemAmount(item),
    0
  );
  const gstAmount = calculateTotal * gstRate;
  const cgstAmount = calculateTotal * cgstRate;
  const sgstAmount = calculateTotal * sgstRate;

  const TOTAL = calculateTotal + gstAmount;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <input type="hidden" name="id" value={invoice.id} />
          <input
            type="hidden"
            name={fields.date.name}
            value={selectedDate.toISOString()}
          />
          <input
            type="hidden"
            name={fields.total.name}
            value={TOTAL.toFixed(2)}
          />
          <div className="flex flex-col gap-1 w-fit mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Editing</Badge>
              <Input
                name={fields.invoiceName.name}
                key={fields.invoiceName.key}
                defaultValue={invoice.invoiceName}
                placeholder="Invoice Title"
              />
            </div>
            <p className="text-sm text-red-500">{fields.invoiceName.errors}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label>Invoice No.</Label>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                  #
                </span>
                <Input
                  name={fields.invoiceNumber.name}
                  key={fields.invoiceNumber.key}
                  defaultValue={invoice.invoiceNumber}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-red-500 text-sm">{fields.invoiceNumber.errors}</p>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                defaultValue={invoice.currency}
                name={fields.currency.name}
                key={fields.currency.key}
                onValueChange={(value) => setCurrency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee -- INR</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.currency.errors}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>From</Label>
              <div className="space-y-2">
                <Input
                  name={fields.fromName.name}
                  key={fields.fromName.key}
                  defaultValue={invoice.fromName}
                />
                <Input
                  name={fields.fromEmail.name}
                  key={fields.fromEmail.key}
                  defaultValue={invoice.fromEmail}
                />
                <Input
                  name={fields.fromAddress.name}
                  key={fields.fromAddress.key}
                  defaultValue={invoice.fromAddress}
                />
              </div>
            </div>

            <div>
              <Label>To</Label>
              <div className="space-y-2">
                <Input
                  name={fields.clientName.name}
                  key={fields.clientName.key}
                  defaultValue={invoice.clientName}
                />
                <Input
                  name={fields.clientEmail.name}
                  key={fields.clientEmail.key}
                  defaultValue={invoice.clientEmail}
                />
                <Input
                  name={fields.clientAddress.name}
                  key={fields.clientAddress.key}
                  defaultValue={invoice.clientAddress}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] text-left justify-start">
                    <CalendarIcon />
                    {selectedDate ? (
                      new Intl.DateTimeFormat("en-US", {
                        dateStyle: "long",
                      }).format(selectedDate)
                    ) : (
                      <span>Pick a Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    mode="single"
                    fromDate={new Date("2020-01-01")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Invoice Due</Label>
              <Select
                name={fields.dueDate.name}
                key={fields.dueDate.key}
                defaultValue={invoice.dueDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on Receipt</SelectItem>
                  <SelectItem value="15">Net 15</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                  <SelectItem value="60">Net 60</SelectItem>
                  <SelectItem value="90">Net 90</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Items */}
          <div>
            <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
              <p className="col-span-5">Description</p>
              <p className="col-span-2">Quantity</p>
              <p className="col-span-2">Rate</p>
              <p className="col-span-2">Amount</p>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-center">
                <div className="col-span-5">
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    value={formatCurrency({
                      amount: getItemAmount(item),
                      currency: currency as any,
                    })}
                    disabled
                  />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                      type="button"
                    >
                      <Trash />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button onClick={addItem} type="button" variant="outline" className="mb-6">
              + Add Item
            </Button>
          </div>

          <div className="flex justify-end py-2 font-semibold text-lg border-t">
            <span>Item Total:</span>
            <span className="ml-2">
              {formatCurrency({
                amount: calculateTotal,
                currency: currency as any,
              })}
            </span>
          </div>

          <div className="mb-6 flex justify-end font-semibold text-lg">
            GST (18%): ₹{gstAmount.toFixed(2)}
          </div>
          <p><strong>CGST (9%):</strong> ₹{cgstAmount.toFixed(2)}</p>
          <p><strong>SGST (9%):</strong> ₹{sgstAmount.toFixed(2)}</p>

          <div className="mb-6 flex justify-end font-semibold text-lg">
            Grand Total: ₹{TOTAL.toFixed(2)}
          </div>

          <div className="mb-6">
            <Label>Notes</Label>
            <Textarea
              name={fields.note.name}
              key={fields.note.key}
              defaultValue={invoice.note}
              placeholder="Write any notes here..."
              rows={3}
            />
          </div>

          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="flex items-center justify-end mt-6">
            <SubmitButton text="Update Invoice" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
