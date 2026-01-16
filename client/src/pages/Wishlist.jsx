import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

function Wishlist() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    API.get("/wishlist")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setItems(res.data);
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = (wishlistId) => {
    API.delete(`/wishlist/${wishlistId}`).then(fetchWishlist);
  };

  const addToCart = (productId) => {
    API.post("/cart", { product_id: productId })
      .then(() => {
        // Remove from wishlist after adding to cart
        // Find the wishlist item ID for this product
        const wishlistItem = items.find(item => item.product_id === productId);
        if (wishlistItem) {
          API.delete(`/wishlist/${wishlistItem.id}`).then(fetchWishlist);
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  };

  const calculateDiscountPercent = (price, discountPrice) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) return <div className="p-10 text-center bg-[#f1f3f6] min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8">
      <div className="max-w-[1200px] mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ================= LEFT COL: WISHLIST ITEMS ================= */}
          <div className="lg:col-span-2 space-y-4">

            {/* Header Area */}
            <div className="bg-white rounded-sm shadow-sm p-4 flex justify-between items-center">
               <h2 className="font-semibold text-lg flex items-center gap-2">
                 <Heart className="w-5 h-5 text-red-500" />
                 My Wishlist ({items.length})
               </h2>
            </div>

            {items.length === 0 ? (
               <div className="bg-white rounded-sm shadow-sm p-8 text-center flex flex-col items-center">
                  <Heart className="w-24 h-24 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Your wishlist is empty!</p>
                  <p className="text-sm text-gray-500 mb-4">Add items to it now.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-[#2874f0] text-white px-10 py-2 rounded-sm shadow-sm font-medium"
                  >
                    Shop Now
                  </button>
               </div>
            ) : (
               <div className="bg-white rounded-sm shadow-sm">
                  {items.map((item) => (
                  <div
                     key={item.id}
                     className="flex flex-col md:flex-row gap-6 p-6 border-b border-gray-100 last:border-0"
                  >
                     {/* Image */}
                     <div className="w-24 h-24 flex-shrink-0 mx-auto md:mx-0">
                        <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                           e.target.src = "https://via.placeholder.com/150";
                        }}
                        />
                     </div>

                     {/* Details */}
                     <div className="flex-1 space-y-2">
                        <h4 className="text-gray-900 font-medium hover:text-[#2874f0] cursor-pointer line-clamp-1">
                           {item.title}
                        </h4>
                        <p className="text-xs text-gray-500">Seller: RetailNet</p>

                        <div className="flex items-baseline gap-3 my-2">
                           {item.discount_price ? (
                              <>
                                 <span className="text-gray-500 text-sm line-through">
                                    ₹{item.price.toLocaleString("en-IN")}
                                 </span>
                                 <span className="text-xl font-bold text-gray-900">
                                    ₹{item.discount_price.toLocaleString("en-IN")}
                                 </span>
                                 <span className="text-sm text-[#388e3c] font-medium">
                                    {calculateDiscountPercent(item.price, item.discount_price)}% Off
                                 </span>
                              </>
                           ) : (
                              <span className="text-xl font-bold text-gray-900">
                                 ₹{item.price.toLocaleString("en-IN")}
                              </span>
                           )}
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-6 mt-4">
                           <button
                              onClick={() => addToCart(item.product_id)}
                              className="bg-[#fb641b] text-white px-4 py-2 rounded-sm font-medium text-sm flex items-center gap-2 hover:bg-[#e55b16]"
                           >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                           </button>

                           <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm font-semibold uppercase text-gray-800 hover:text-red-500 flex items-center gap-1"
                           >
                              <Heart className="w-4 h-4" />
                              Remove
                           </button>
                        </div>
                     </div>
                  </div>
                  ))}
               </div>
            )}
          </div>

          {/* ================= RIGHT COL: EMPTY FOR NOW ================= */}
          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h3 className="text-gray-800 font-semibold mb-4">Wishlist Summary</h3>
                <p className="text-sm text-gray-600">
                  {items.length} item{items.length !== 1 ? 's' : ''} saved for later
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-4 bg-[#2874f0] text-white py-2 rounded-sm font-medium hover:bg-[#1c5bb8]"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;