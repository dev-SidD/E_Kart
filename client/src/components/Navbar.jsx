import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Search, Heart, Package } from "lucide-react";

function Navbar({ cartCount = 0 }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="bg-[#2874f0] sticky top-0 z-50 shadow-md h-16 flex items-center">
      <div className="max-w-[1400px] w-full mx-auto px-4 flex items-center justify-between">
        
        {/* ================= LOGO ================= */}
        <Link to="/" className="flex flex-col group">
          <span className="text-white font-bold text-xl italic tracking-wide">
            Ekart
          </span>
          <span className="text-[#ffe500] text-[10px] italic font-medium -mt-1 group-hover:underline">
            Explore <span className="text-white">Plus</span>
          </span>
        </Link>

        {/* ================= SEARCH BAR ================= */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl mx-8 hidden md:block relative"
        >
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full px-4 py-2 pr-12 rounded-sm text-sm text-gray-900 placeholder-gray-500 focus:outline-none shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-3 text-[#2874f0] hover:bg-gray-50 rounded-r-sm transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* ================= RIGHT ACTIONS ================= */}
        <div className="flex items-center gap-6">

          {/* Login Button (Visual Only to match style) */}
          <button className="hidden sm:block px-8 py-1 bg-white text-[#2874f0] font-semibold text-sm rounded-sm hover:bg-gray-50 transition-colors shadow-sm">
            Login
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="flex items-center gap-2 text-white font-medium hover:text-gray-100 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>

          {/* Orders Link */}
          <Link
            to="/orders"
            className="flex items-center gap-2 text-white font-medium hover:text-gray-100 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="hidden sm:inline">Orders</span>
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="flex items-center gap-2 text-white font-medium hover:text-gray-100 transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />

              {/* Cart Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full border border-[#2874f0]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;