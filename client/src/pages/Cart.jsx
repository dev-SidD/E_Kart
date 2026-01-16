import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Info } from "lucide-react";

function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    API.get("/cart")
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
    fetchCart();
  }, []);

  const updateQuantity = (cartId, newQty) => {
    if (newQty < 1) return;
    // Optimistic UI update could happen here, but we'll stick to API first for safety
    API.put(`/cart/${cartId}`, { quantity: newQty }).then(fetchCart);
  };

  const removeItem = (cartId) => {
    API.delete(`/cart/${cartId}`).then(fetchCart);
  };

  // Calculations
  const totalSellingPrice = items.reduce(
    (sum, item) => sum + Number(item.discount_price || item.price) * item.quantity,
    0
  );

  const totalMRP = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalDiscount = totalMRP - totalSellingPrice;

  const calculateDiscountPercent = (price, discountPrice) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) return <div className="p-10 text-center bg-[#f1f3f6] min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* ================= LEFT COL: CART ITEMS ================= */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header Area */}
            <div className="bg-white rounded-sm shadow-sm p-4 flex justify-between items-center">
               <h2 className="font-semibold text-lg">My Cart ({items.length})</h2>
            </div>

            {items.length === 0 ? (
               <div className="bg-white rounded-sm shadow-sm p-8 text-center flex flex-col items-center">
                  <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty Cart" className="w-48 mb-4 opacity-80" />
                  <p className="text-lg font-medium">Your cart is empty!</p>
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
                           <div className="flex items-center gap-2">
                              <button
                                 onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                 disabled={item.quantity === 1}
                                 className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-50 hover:border-gray-800"
                              >
                                 −
                              </button>
                              <div className="w-10 text-center border-gray-200 text-sm font-medium">
                                 {item.quantity}
                              </div>
                              <button
                                 onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                 className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800"
                              >
                                 +
                              </button>
                           </div>

                           <button className="text-sm font-semibold uppercase text-gray-800 hover:text-[#2874f0]">
                              Save for later
                           </button>
                           <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm font-semibold uppercase text-gray-800 hover:text-[#2874f0]"
                           >
                              Remove
                           </button>
                        </div>
                     </div>
                  </div>
                  ))}
                  
                  {/* Place Order Sticky Bottom (Desktop style inside card) */}
                  <div className="p-4 border-t border-gray-100 flex justify-end shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sticky bottom-0 bg-white">
                     <button
                        onClick={() => navigate("/checkout")}
                        className="bg-[#fb641b] text-white px-10 py-3 rounded-sm font-bold shadow text-sm uppercase tracking-wide hover:bg-[#e55b16]"
                     >
                        Place Order
                     </button>
                  </div>
               </div>
            )}
          </div>

          {/* ================= RIGHT COL: PRICE DETAILS ================= */}
          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-sm shadow-sm p-0 h-fit sticky top-20">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-gray-500 font-bold text-sm uppercase">Price Details</h3>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex justify-between text-gray-900">
                    <span>Price ({items.length} items)</span>
                    <span>₹{totalMRP.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-900">
                    <span>Discount</span>
                    <span className="text-[#388e3c]">- ₹{totalDiscount.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-900">
                    <span>Delivery Charges</span>
                    <span className="text-[#388e3c]">Free</span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 my-4"></div>

                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{totalSellingPrice.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 my-4"></div>

                  <p className="text-[#388e3c] font-medium text-sm">
                    You will save ₹{totalDiscount.toLocaleString("en-IN")} on this order
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-gray-500 text-xs px-2">
                 <ShieldCheck className="w-8 h-8 text-gray-400" />
                 <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;