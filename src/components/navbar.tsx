import Link from "next/link";
import AuthShowcase from "./authShowcase";

const Navbar: React.FC = () => {
  return (
    <div className="flex border-b border-black">
      <div className="flex items-center p-3">
        <Link href="/">Home</Link>
      </div>
      <div className="ml-auto">
        <AuthShowcase />
      </div>
    </div>
  );
};

export default Navbar;
