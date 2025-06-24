import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/favicon.ico";
import { buttonVariants } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function Navbar() {
  return (
    <div className="flex items-center justify-between py-5">
      <Link href="/" className="flex items-center gap-2">
        <Image src={Logo} alt="Logo" className="size-10" />
        <div className="flex flex-col justify-center leading-none">
            <span className="text-2xl  font-extrabold">REPULSO</span>
            <span className="text-primary text-sm tracking-wider">
              INVOICE
            </span>
          </div>
      </Link>
      <Link href="/login">
        <RainbowButton >Get Started</RainbowButton>
      </Link>
    </div>
  );
}
