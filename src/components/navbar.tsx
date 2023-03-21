/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Link from "next/link";
import AuthShowcase from "./authShowcase";
import Image from "next/image";
import bowSvg from "../../public/bow.svg";

const Navbar: React.FC = () => {
  return (
    <div className="flex border-b border-black">
      <div className="flex items-center p-3">
        <Link href="/">
          <Image src={bowSvg} alt="logo" width="60" height="70" />
        </Link>
      </div>
      <div className="ml-auto">
        <AuthShowcase />
      </div>
    </div>
  );
};

export default Navbar;
