"use client";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchModal from "./SearchModal";

export default function Header() {
  const pathname = usePathname();
  return (
    <header>
      <div className="main-container inner">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={30} height={30} />
        </Link>
        <nav>
          <Link
            href="/"
            className={cn("nav-link", {
              "is-active": pathname === "/",
              "is-home": true,
            })}>
            Home
          </Link>
          {/* Search Modal */}
          <SearchModal />
          <Link
            href="/coins"
            className={cn("nav-link", {
              "is-active": pathname === "/coins",
            })}>
            All Coins
          </Link>
        </nav>
      </div>
    </header>
  );
}
