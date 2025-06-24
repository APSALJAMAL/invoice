// utils/getUser.ts

import prisma from "./db";
import { redirect } from "next/navigation";

export async function getUser(userId?: string) {
 

  const data = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      address: true,
      role:true,
    },
  });

  console.log("user data", data);

  if (!data?.name || !data?.address) {
    redirect("/onboarding");
  }

  return data;
}
