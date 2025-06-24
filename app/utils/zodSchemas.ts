import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "First name is required"),

  address: z.string().min(2, "Address is required"),
});

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice Name is required"),
  total: z.preprocess(
    val => typeof val === "string" ? parseFloat(val) : val,
    z.number()
  .min(1, "1$ is minimum")),
  

  status: z.enum(["PAID", "PENDING"]).default("PENDING"),

  date: z.string().min(1, "Date is required"),

  dueDate: z.number().min(0, "Due Date is required"),

  fromName: z.string().min(1, "Your name is required"),

  fromEmail: z.string().email("Invalid Email address"),

  fromAddress: z.string().min(1, "Your address is required"),

  clientName: z.string().min(1, "Client name is required"),

  clientEmail: z.string().email("Invalid Email address"),

  clientAddress: z.string().min(1, "Client address is required"),

  currency: z.string().min(1, "Currency is required"),

  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),

  note: z.string().optional(),

  items: z.preprocess((val) => {
    if (typeof val === "string") return JSON.parse(val);
    return val;
  }, z.array(z.object({
    description: z.string().min(1),
    quantity: z.number(),
    rate: z.number(),
  }))),
});
