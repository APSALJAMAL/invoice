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
import { createInvoice } from "../actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema } from "../utils/zodSchemas";
import { formatCurrency } from "../utils/formatCurrency";

interface iAppProps {
  name: string;
  address: string;
  email: string;
}

interface Item {
  description: string;
  quantity: string; // keep as string for input binding
  rate: string;
}

export function CreateInvoice({
  address,
  email,
  name,

}: iAppProps) {
  const [lastResult, action] = useActionState(createInvoice, undefined);
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      // We'll stringify items array to send it as a string in formData
      if (!formData.get("items")) {
        formData.set("items", JSON.stringify(items));
      }
      return parseWithZod(formData, {
        schema: invoiceSchema,
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currency, setCurrency] = useState("INR");
  

  // Manage multiple items dynamically
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: "", rate: "" },
  ]);

  // Handle change in item input fields
  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Add a new empty item
  const addItem = () => {
    setItems([...items, { description: "", quantity: "", rate: "" }]);
  };

  // Remove item by index
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculate total amount per item
  const getItemAmount = (item: Item) =>
    (Number(item.quantity) || 0) * (Number(item.rate) || 0);


  const gstRate = 0.18;   // 18% GST
const cgstRate = gstRate / 2;  // CGST is half of GST, i.e., 9%
const sgstRate = cgstRate; // SGST (9%)
  // Calculate grand total
  const calculateTotal = items.reduce(
    (acc, item) => acc + getItemAmount(item),
    0
  );
  const gstAmount = calculateTotal * gstRate;
  const cgstAmount = calculateTotal * cgstRate;
  const sgstAmount = calculateTotal * sgstRate;

  const TOTAL=calculateTotal + gstAmount;



  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
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
              <Badge variant="secondary">Draft</Badge>
              <Input
                name={fields.invoiceName.name}
                key={fields.invoiceName.key}
                defaultValue={fields.invoiceName.initialValue}
                placeholder="Test 123"
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
                  defaultValue={fields.invoiceNumber.initialValue}
                  className="rounded-l-none"
                  placeholder="5"
                />
              </div>
              <p className="text-red-500 text-sm">{fields.invoiceNumber.errors}</p>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                defaultValue="INR"
                name={fields.currency.name}
                key={fields.currency.key}
                onValueChange={(value) => setCurrency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="USD">United States Dollar -- USD</SelectItem>
                  <SelectItem value="EUR">Euro -- EUR</SelectItem> */}
                 
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
                  placeholder="Your Name"
                  defaultValue={`${name}`}
                />
                <p className="text-red-500 text-sm">{fields.fromName.errors}</p>
                <Input
                  placeholder="Your Email"
                  name={fields.fromEmail.name}
                  key={fields.fromEmail.key}
                  defaultValue={email}
                />
                <p className="text-red-500 text-sm">{fields.fromEmail.errors}</p>
                <Input
                  placeholder="Your Address"
                  name={fields.fromAddress.name}
                  key={fields.fromAddress.key}
                  defaultValue={address}
                />
                <p className="text-red-500 text-sm">{fields.fromAddress.errors}</p>
              </div>
            </div>

            <div>
              <Label>To</Label>
              <div className="space-y-2">
                <Input
                  name={fields.clientName.name}
                  key={fields.clientName.key}
                  defaultValue={fields.clientName.initialValue}
                  placeholder="Client Name"
                />
                <p className="text-red-500 text-sm">{fields.clientName.errors}</p>
                <Input
                  name={fields.clientEmail.name}
                  key={fields.clientEmail.key}
                  defaultValue={fields.clientEmail.initialValue}
                  placeholder="Client Email"
                />
                <p className="text-red-500 text-sm">{fields.clientEmail.errors}</p>
                <Input
                  name={fields.clientAddress.name}
                  key={fields.clientAddress.key}
                  defaultValue={fields.clientAddress.initialValue}
                  placeholder="Client Address"
                />
                <p className="text-red-500 text-sm">{fields.clientAddress.errors}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div>
                <Label>Date</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] text-left justify-start"
                  >
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
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-red-500 text-sm">{fields.date.errors}</p>
            </div>

            <div>
              <Label>Invoice Due</Label>
              <Select
                name={fields.dueDate.name}
                key={fields.dueDate.key}
                defaultValue={fields.dueDate.initialValue}
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
              <p className="text-red-500 text-sm">{fields.dueDate.errors}</p>
            </div>
          </div>

          {/* Items list with dynamic add/remove */}
          <div>
            <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
              <p className="col-span-5">Description</p>
              <p className="col-span-2">Quantity</p>
              <p className="col-span-2">Rate</p>
              <p className="col-span-2">Amount</p>
            </div>
{/* //////////////////// */}
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-center">
                <div className="col-span-5">
                  <Textarea
                    placeholder="Item name & description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    
                    placeholder="0"
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

                <div className="col-span-1  justify-end">
                  {items.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                      type="button"
                      className="ml-2"
                    >
                      <Trash/>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button onClick={addItem} type="button" variant="outline" className="mb-6">
              + Add Item
            </Button>
          </div>

          <div className="flex justify-end">
            
              
              <div className="flex justify-between py-2 font-semibold text-lg border-t">
                <span>Item Total:{" "} </span>
                <span className="ml-2">
                  {formatCurrency({
                    amount: calculateTotal,
                    currency: currency as any,
                  })}
                </span>
              </div>
            </div>
          
          <div className="mb-6  flex justify-end font-semibold text-lg">
        GST (18%): ₹{gstAmount.toFixed(2)}
      </div>
      <p>
        <strong>CGST (9%):</strong> ₹{cgstAmount.toFixed(2)}
      </p>
      <p>
        <strong>SGST (9%):</strong> ₹{sgstAmount.toFixed(2)}
      </p>
      
      <div className="mb-6 flex justify-end font-semibold text-lg">
            Grand Total:₹{TOTAL.toFixed(2)}
            
          </div>

          <div className="mb-6">
            <Label>Notes</Label>
            <Textarea
              name={fields.note.name}
              key={fields.note.key}
              defaultValue={fields.note.initialValue}
              placeholder="Write any notes here..."
              rows={3}
            />
            <p className="text-red-500 text-sm">{fields.note.errors}</p>
          </div>
          <input type="hidden" name="items" value={JSON.stringify(items)} />


          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Send Invoice to Client" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
