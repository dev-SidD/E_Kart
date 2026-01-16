import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Flashlight, 
  Heart, 
  Share2, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Tag,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import API from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Fetch product
    API.get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        // Fallback if images array missing
        if (!p.images || p.images.length === 0) {
          p.images = [p.image_url];
        }
        setProduct(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check if product already in cart
    API.get("/cart").then((res) => {
      if (Array.isArray(res.data)) {
        const exists = res.data.some((item) => item.product_id === Number(id));
        setIsInCart(exists);
      }
    });

    // Check if product is in wishlist
    API.get(`/wishlist/status/${id}`).then((res) => {
      setIsInWishlist(res.data.isInWishlist);
    });
  }, [id]);

  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const wishlistResponse = await API.get("/wishlist");
        const itemToRemove = wishlistResponse.data.find(item => item.product_id === Number(id));
        if (itemToRemove) {
          await API.delete(`/wishlist/${itemToRemove.id}`);
          setIsInWishlist(false);
        }
      } else {
        // Add to wishlist
        await API.post("/wishlist", { product_id: Number(id) });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  if (loading) 
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="bg-white p-4 rounded shadow">Loading...</div>
      </div>
    );
    
  if (!product) 
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );

  const totalImages = product.images.length;

  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const outOfStock = product.stock_quantity === 0;
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleAddToCart = async () => {
    await API.post("/cart", { product_id: product.id });
    setIsInCart(true);
  };

  const calculateDiscount = (price, discountPrice) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-4">
      <div className="max-w-[1400px] mx-auto px-2 lg:px-4">
        
        <div className="bg-white rounded-sm shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          
          {/* ================= LEFT COLUMN (IMAGES & BUTTONS) ================= */}
          <div className="lg:col-span-5 p-4 lg:sticky lg:top-20 h-fit border-r border-gray-100">
            <div className="relative">
              
              {/* Wishlist & Share (Absolute) */}
              <div className="absolute top-0 right-0 z-10 flex flex-col gap-3">
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full bg-white shadow-md border border-gray-100 transition-colors ${isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
                </button>
                <button className="p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Main Image Viewer */}
              <div className="border border-gray-200 rounded-sm p-4 h-[450px] flex items-center justify-center relative group">
                <img
                  src={product.images[activeImage]}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400";
                  }}
                />

                {/* Navigation Arrows */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 bg-white/90 hover:bg-white shadow-md border border-gray-200 rounded-full p-2 text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 bg-white/90 hover:bg-white shadow-md border border-gray-200 rounded-full p-2 text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {totalImages > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 border-2 rounded-sm p-1 cursor-pointer transition-colors flex-shrink-0
                        ${
                          activeImage === index
                            ? "border-[#2874f0]"
                            : "border-gray-200 hover:border-[#2874f0]"
                        }
                      `}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                {!isInCart ? (
                  <button
                    disabled={outOfStock}
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 rounded-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-colors
                      ${outOfStock 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-[#ff9f00] hover:bg-[#f39700]"
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4 fill-white" />
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/cart")}
                    className="flex-1 py-3.5 rounded-sm font-bold text-white shadow-sm bg-[#ff9f00] hover:bg-[#f39700] flex items-center justify-center gap-2 uppercase tracking-wide transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 fill-white" />
                    Go to Cart
                  </button>
                )}

                <button
                  disabled={outOfStock}
                  onClick={() => navigate("/checkout")}
                  className={`flex-1 py-3.5 rounded-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-colors
                    ${outOfStock
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#fb641b] hover:bg-[#e55b16]"
                    }`}
                >
                  <Flashlight className="w-4 h-4 fill-white" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (DETAILS) ================= */}
          <div className="lg:col-span-7 p-6">
            
            {/* Breadcrumb / Title */}
            <div>
              <p className="text-gray-500 text-xs mb-2 hover:text-[#2874f0] cursor-pointer" onClick={() => navigate('/')}>
                 Home &gt; {product.category} &gt; {product.title}
              </p>
              <h1 className="text-lg md:text-xl text-gray-800 font-normal">
                {product.title}
              </h1>
            </div>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-gray-500 text-sm font-medium">1,245 Ratings & 342 Reviews</span>
            </div>

            {/* Price Area */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-medium text-gray-900">
                ₹{(product.discount_price || product.price).toLocaleString('en-IN')}
              </span>
              {product.discount_price && (
                <>
                  <span className="text-gray-500 text-sm line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[#388e3c] font-medium text-sm">
                    {calculateDiscount(product.price, product.discount_price)}% off
                  </span>
                </>
              )}
            </div>

            {/* Stock Status Message */}
            {outOfStock ? (
               <div className="mt-2 flex items-center gap-1 text-red-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> Out of Stock
               </div>
            ) : lowStock ? (
               <div className="mt-2 flex items-center gap-1 text-orange-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> Hurry, Only {product.stock_quantity} left!
               </div>
            ) : null}

            {/* Offers Section (Mock Data for Style) */}
            <div className="mt-6">
              <h3 className="font-medium text-sm text-gray-900 mb-2">Available offers</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[#388e3c] mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Bank Offer</span> 5% Cashback on Flipkart Axis Bank Card
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[#388e3c] mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Special Price</span> Get extra 10% off (price inclusive of cashback/coupon)
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            <div className="mt-8 border rounded-sm">
               <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-800">Specifications</h3>
               </div>
               <div className="p-4 space-y-4">
                  <div className="grid grid-cols-12 gap-2">
                     <div className="col-span-4 md:col-span-3 text-sm text-gray-500">Category</div>
                     <div className="col-span-8 md:col-span-9 text-sm text-gray-900 capitalize">{product.category}</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                     <div className="col-span-4 md:col-span-3 text-sm text-gray-500">Stock Status</div>
                     <div className="col-span-8 md:col-span-9 text-sm text-gray-900">
                        {outOfStock ? "Currently Unavailable" : "In Stock"}
                     </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                     <div className="col-span-4 md:col-span-3 text-sm text-gray-500">Description</div>
                     <div className="col-span-8 md:col-span-9 text-sm text-gray-900 leading-relaxed">
                        {product.description || "No description available for this product."}
                     </div>
                  </div>
                  
                  {/* Mock Warranty - to fill space like real site */}
                  <div className="grid grid-cols-12 gap-2">
                     <div className="col-span-4 md:col-span-3 text-sm text-gray-500">Warranty</div>
                     <div className="col-span-8 md:col-span-9 text-sm text-gray-900">
                        1 Year Manufacturer Warranty
                     </div>
                  </div>
               </div>
            </div>

            {/* Trust Markers */}
            <div className="mt-8 flex gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-200 rounded-full p-1">
                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                    </div>
                    Authentic Products
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-gray-200 rounded-full p-1">
                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                    </div>
                    Secure Payments
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;