import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

function OrderSuccess() {
  const navigate = useNavigate();
  // Generate order ID for display purposes (demo only)
  const orderId = Math.floor(Math.random() * 1000000); // eslint-disable-line

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-sm max-w-md w-full overflow-hidden relative">
        
        {/* Top Decoration Line */}
        <div className="h-1 bg-[#388e3c] w-full absolute top-0"></div>

        <div className="p-8 text-center">
          {/* Animated Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white rounded-full p-2">
                <CheckCircle className="w-16 h-16 text-[#388e3c]" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Thank you for shopping with Ekart. Your order has been confirmed and will be delivered shortly.
          </p>

          {/* Reward Section (Mock) */}
          <div className="bg-[#f0f5ff] border border-blue-100 rounded-sm p-4 mb-8 flex items-center gap-3 text-left">
            <div className="bg-[#ffc200] w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm border-2 border-white">
              $
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">You earned 12 SuperCoins!</p>
              <p className="text-xs text-gray-500">Use them to save on your next order.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#2874f0] text-white py-3 rounded-sm font-medium hover:bg-[#1c5bb8] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              View Orders
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Footer decoration */}
        <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">Order ID: #{orderId}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;