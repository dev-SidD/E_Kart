import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Filter, X, Search } from "lucide-react";

const categories = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
];

function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search || "");
  const navigate = useNavigate();

  // Update search query when URL params change
  useEffect(() => {
    setSearchQuery(search || "");
  }, [search]);

  useEffect(() => {
    let url = "/products";
    const params = [];

    if (selectedCategory) {
      params.push(`category=${selectedCategory}`);
    }

    if (search) {
      params.push(`search=${search}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    API.get(url)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [selectedCategory, search]);

  const calculateDiscount = (price, discountPrice) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    } else {
      navigate("/");
      setSearchOpen(false);
    }
  };


  // Handle wishlist toggle
  const toggleWishlist = async (productId, e) => {
    e.stopPropagation();
    try {
      if (wishlistItems.has(productId)) {
        // Remove from wishlist
        const wishlistItem = await API.get("/wishlist");
        const itemToRemove = wishlistItem.data.find(item => item.product_id === productId);
        if (itemToRemove) {
          await API.delete(`/wishlist/${itemToRemove.id}`);
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        // Add to wishlist
        await API.post("/wishlist", { product_id: productId });
        setWishlistItems(prev => new Set([...prev, productId]));
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  // Check wishlist status when products change
  useEffect(() => {
    if (products.length > 0 && !loading) {
      const checkWishlist = async () => {
        try {
          const wishlistPromises = products.map(product =>
            API.get(`/wishlist/status/${product.id}`)
          );
          const results = await Promise.all(wishlistPromises);
          const wishlistSet = new Set();
          results.forEach((result, index) => {
            if (result.data.isInWishlist) {
              wishlistSet.add(products[index].id);
            }
          });
          setWishlistItems(wishlistSet);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      };
      checkWishlist();
    }
  }, [products, loading]);

  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>

          <div className="flex items-center gap-2">
            {selectedCategory && (
              <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedCategory.replace(/-/g, " ")}
              </span>
            )}

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full bg-white border-b border-gray-200 p-4 z-50">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874f0] hover:bg-gray-100 p-1 rounded transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="flex relative">
        {/* ================= SIDEBAR ================= */}
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Content */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-80 lg:w-64 bg-white shadow-lg lg:shadow-sm
          border-r border-gray-200 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:h-screen lg:sticky lg:top-16
        `}>
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg">Filters</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4">
            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3 uppercase text-gray-700">Categories</h4>

              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left py-3 px-3 rounded-lg capitalize text-sm font-medium transition-colors ${
                  selectedCategory === ""
                    ? "text-[#2874f0] bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                All Products
              </button>

              <div className="mt-2 space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSidebarOpen(false);
                    }}
                    className={`block w-full text-left py-3 px-3 rounded-lg capitalize text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "text-[#2874f0] bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {cat.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= PRODUCT GRID ================= */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Search Results Header */}
            {search && (
              <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <p className="text-sm sm:text-base text-gray-600">
                  Showing results for{" "}
                  <span className="font-semibold text-gray-900">"{search}"</span>
                </p>
              </div>
            )}

            {/* Loading/Empty State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 rounded-lg shadow-sm text-center">
                <p className="text-gray-500 text-base sm:text-lg">No products found.</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 group relative overflow-hidden border border-gray-100"
                  >
                    <div className="relative">
                      <div
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="p-3 sm:p-4"
                      >
                        <div className="relative aspect-square mb-2 sm:mb-3 flex items-center justify-center bg-gray-50 rounded-md">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="max-h-full max-w-full object-contain p-2"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                          <h4 className="text-xs sm:text-sm text-gray-800 line-clamp-2 min-h-[32px] sm:min-h-[40px] leading-tight">
                            {p.title}
                          </h4>

                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="flex items-center gap-1 bg-[#388e3c] text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                              <span>{p.rating}</span>
                              <span>★</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 gap-1">
                            <span className="text-base sm:text-lg font-semibold text-gray-900">
                              ₹{(p.discount_price || p.price).toLocaleString("en-IN")}
                            </span>
                            {p.discount_price && (
                              <>
                                <span className="text-xs sm:text-sm text-gray-500 line-through">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-[#388e3c] block sm:inline">
                                  {calculateDiscount(p.price, p.discount_price)}% off
                                </span>
                              </>
                            )}
                          </div>

                          {p.stock_quantity > 0 && p.stock_quantity < 10 && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              Only {p.stock_quantity} left
                            </p>
                          )}

                          {p.stock_quantity === 0 && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              Out of stock
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 touch-manipulation ${
                          wishlistItems.has(p.id) ? 'opacity-100' : ''
                        }`}
                        onClick={(e) => toggleWishlist(p.id, e)}
                      >
                        <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${wishlistItems.has(p.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;