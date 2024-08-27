import React from "react";
import Link from "next/link";

const NavMenu = () => {
  return (
    <nav className="flex font-bold gap-x-3">
      <Link href="/admin">Admin</Link>
      <Link href="/resetqr">QR club</Link>
    </nav>
  );
};

export default NavMenu;
