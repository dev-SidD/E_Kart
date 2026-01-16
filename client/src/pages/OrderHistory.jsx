import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrderHistory = () => {
    API.get("/orders")
      .then((res) => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'shipped':
        return 'text-blue-700 bg-blue-100';
      case 'processing':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) return <div className="p-10 text-center bg-[#f1f3f6] min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8">
      <div className="max-w-[1200px] mx-auto px-4">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#2874f0] text-white px-8 py-2 rounded-sm font-medium hover:bg-[#1c5bb8]"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-sm shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.order_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{order.total_amount?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 flex-shrink-0 mx-auto sm:mx-0">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                        </div>

                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              ₹{item.price_at_purchase?.toLocaleString('en-IN')}
                            </span>
                            {item.discount_price && item.discount_price < item.price_at_purchase && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{item.discount_price?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{(item.price_at_purchase * item.quantity)?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery Address:</p>
                      <p className="text-sm text-gray-600">{order.customer_address}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/product/${order.items?.[0]?.product_id || ''}`)}
                        className="px-4 py-2 text-sm font-medium text-[#2874f0] border border-[#2874f0] rounded-sm hover:bg-[#2874f0] hover:text-white transition-colors"
                      >
                        Buy Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;