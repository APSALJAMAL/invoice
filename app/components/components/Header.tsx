import Image from "next/image";
import UserButton from "./UserButton";
import logo from '@/app/favicon.ico';

export default function Header() {
  return (
    <header className="flex justify-center border-b">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        
        {/* Left side: Logo */}
        <div className="flex items-center space-x-2">
          <Image src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold">REPULSO</span>
        </div>

        {/* Right side: User Button and External Link */}
        <div className="flex items-center space-x-4">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Link1
          </a>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
