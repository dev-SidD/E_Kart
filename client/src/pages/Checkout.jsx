import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Truck,
  Package 
} from "lucide-react";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: ""
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/cart")
      .then((res) => {
        setCartItems(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calculations
  const totalSellingPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.discount_price || item.price) * item.quantity,
    0
  );

  const totalMRP = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalDiscount = totalMRP - totalSellingPrice;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    if (!form.name || !form.email || !form.address || !form.pincode) {
      alert("Please fill all details correctly");
      return;
    }

    try {
      await API.post("/orders", {
        customer_name: form.name,
        customer_email: form.email,
        customer_address: `${form.address}, ${form.city} - ${form.pincode}`,
        total_amount: totalSellingPrice,
        items: cartItems 
      });

      alert("Order placed successfully 🎉");
      navigate("/order-success"); // Make sure you have this route or change to '/'
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ================= LEFT COLUMN (STEPS) ================= */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Step 1: Login (Mocked as completed) */}
            <div className="bg-white px-6 py-4 rounded-sm shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <span className="bg-[#f0f0f0] text-[#2874f0] font-bold text-xs px-2 py-1 rounded-sm">1</span>
                  <div className="flex flex-col">
                     <span className="text-gray-500 font-medium uppercase text-sm">Login</span>
                     <span className="text-gray-900 font-medium text-sm">+91 9876543210</span>
                  </div>
               </div>
               <button className="text-[#2874f0] font-medium text-sm border border-[#e0e0e0] px-4 py-1 rounded-sm hover:shadow-sm">
                  Change
               </button>
            </div>

            {/* Step 2: Delivery Address (Active) */}
            <div className="bg-white rounded-sm shadow-sm">
               <div className="bg-[#2874f0] px-6 py-3 flex items-center gap-4">
                  <span className="bg-white text-[#2874f0] font-bold text-xs px-2 py-0.5 rounded-sm">2</span>
                  <h3 className="text-white font-medium uppercase text-sm">Delivery Address</h3>
               </div>

               <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="col-span-1">
                        <label className="text-xs text-gray-500 font-bold mb-1 block">NAME</label>
                        <input
                           name="name"
                           value={form.name}
                           onChange={handleChange}
                           className="w-full border border-gray-300 rounded-sm p-2 focus:border-[#2874f0] outline-none text-sm transition-colors"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="text-xs text-gray-500 font-bold mb-1 block">EMAIL</label>
                        <input
                           name="email"
                           value={form.email}
                           onChange={handleChange}
                           className="w-full border border-gray-300 rounded-sm p-2 focus:border-[#2874f0] outline-none text-sm transition-colors"
                        />
                     </div>
                     <div className="col-span-1 md:col-span-2">
                        <label className="text-xs text-gray-500 font-bold mb-1 block">ADDRESS</label>
                        <textarea
                           name="address"
                           rows="2"
                           value={form.address}
                           onChange={handleChange}
                           className="w-full border border-gray-300 rounded-sm p-2 focus:border-[#2874f0] outline-none text-sm transition-colors resize-none"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="text-xs text-gray-500 font-bold mb-1 block">CITY</label>
                        <input
                           name="city"
                           value={form.city}
                           onChange={handleChange}
                           className="w-full border border-gray-300 rounded-sm p-2 focus:border-[#2874f0] outline-none text-sm transition-colors"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="text-xs text-gray-500 font-bold mb-1 block">PINCODE</label>
                        <input
                           name="pincode"
                           value={form.pincode}
                           onChange={handleChange}
                           className="w-full border border-gray-300 rounded-sm p-2 focus:border-[#2874f0] outline-none text-sm transition-colors"
                        />
                     </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-sm border border-gray-100">
                     <Truck className="w-4 h-4 text-[#2874f0]" />
                     <span>Delivery expected by <b>3 Days</b></span>
                  </div>
               </div>
            </div>

            {/* Step 3: Order Summary */}
            <div className="bg-white rounded-sm shadow-sm">
               <div className="bg-[#2874f0] px-6 py-3 flex items-center gap-4">
                  <span className="bg-white text-[#2874f0] font-bold text-xs px-2 py-0.5 rounded-sm">3</span>
                  <h3 className="text-white font-medium uppercase text-sm">Order Summary</h3>
               </div>
               
               <div className="p-4 space-y-4">
                  {cartItems.map((item) => (
                     <div key={item.id} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="w-16 h-16 border border-gray-200 p-1 rounded-sm">
                           <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</h4>
                           <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                           <div className="flex items-baseline gap-2 mt-1">
                              <span className="font-bold text-gray-900">₹{(item.discount_price || item.price).toLocaleString('en-IN')}</span>
                              {item.discount_price && (
                                 <span className="text-xs text-gray-400 line-through">₹{item.price.toLocaleString('en-IN')}</span>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

             {/* Step 4: Payment Options (Mock) */}
             <div className="bg-white px-6 py-4 rounded-sm shadow-sm flex items-center justify-between opacity-50">
               <div className="flex items-center gap-4">
                  <span className="bg-[#f0f0f0] text-[#2874f0] font-bold text-xs px-2 py-1 rounded-sm">4</span>
                  <span className="text-gray-500 font-medium uppercase text-sm">Payment Options</span>
               </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (PRICE DETAILS) ================= */}
          <div className="lg:col-span-1 h-fit sticky top-20">
             <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                   <h3 className="text-gray-500 font-bold text-sm uppercase">Price Details</h3>
                </div>

                <div className="p-4 space-y-4">
                   <div className="flex justify-between text-gray-900 text-sm">
                      <span>Price ({cartItems.length} items)</span>
                      <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                   </div>
                   
                   <div className="flex justify-between text-gray-900 text-sm">
                      <span>Discount</span>
                      <span className="text-[#388e3c]">- ₹{totalDiscount.toLocaleString('en-IN')}</span>
                   </div>
                   
                   <div className="flex justify-between text-gray-900 text-sm">
                      <span>Delivery Charges</span>
                      <span className="text-[#388e3c]">Free</span>
                   </div>

                   <div className="border-t border-dashed border-gray-200 my-2"></div>

                   <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span>₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                   </div>

                   <div className="border-t border-dashed border-gray-200 my-2"></div>

                   <p className="text-[#388e3c] font-medium text-sm">
                      You will save ₹{totalDiscount.toLocaleString('en-IN')} on this order
                   </p>
                </div>
             </div>

             {/* Trust Badge */}
             <div className="mt-6 flex gap-3 items-start px-2">
                <ShieldCheck className="w-8 h-8 text-gray-400" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                   Safe and Secure Payments. Easy returns. 100% Authentic products.
                </p>
             </div>

             {/* Final Action Button */}
             <button
               onClick={placeOrder}
               className="w-full mt-4 bg-[#fb641b] text-white py-3.5 rounded-sm font-bold shadow-md uppercase tracking-wide hover:bg-[#e55b16] transition-colors flex items-center justify-center gap-2"
             >
                <Package className="w-5 h-5" />
                Confirm Order
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;