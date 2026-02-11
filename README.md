# 🛒 E-Kart - Full-Stack E-Commerce Application

A modern, responsive e-commerce platform built with React, Node.js, and MySQL. Experience seamless online shopping with features like product search, wishlist, shopping cart, and order management.

## ✨ Features

### 🛍️ Core E-Commerce Features
- **Product Catalog**: Browse products with categories and search functionality
- **Product Details**: Detailed product pages with images and specifications
- **Shopping Cart**: Add, remove, and update cart items with quantity management
- **Wishlist**: Save favorite products for later
- **Order Placement**: Complete checkout process with customer details
- **Order History**: View past orders with detailed information

### 🎨 User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Modern UI**: Clean and intuitive interface with Tailwind CSS
- **Search Functionality**: Real-time product search with filters
- **Category Navigation**: Organized product browsing by categories
- **Smooth Animations**: Enhanced user interactions with transitions

### 🔧 Technical Features
- **Real-time Updates**: Live cart and wishlist status
- **Data Persistence**: MySQL database with proper relationships
- **API Architecture**: RESTful API endpoints for all operations
- **Error Handling**: Comprehensive error management and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MySQL2** - MySQL database driver
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Database
- **MySQL** - Relational database management system
- **Database Tables**:
  - `products` - Product catalog
  - `cart` - Shopping cart items
  - `orders` - Customer orders
  - `order_items` - Order line items
  - `wishlist` - Saved products
  - `product_images` - Product image gallery

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/dev-SidD/E_Kart.git
   cd E_Kart
   ```

2. **Set Up the Database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE ekart_store;
   EXIT;
   ```

3. **Configure Environment Variables**
   ```bash
   # In the server directory, create .env file
   cd server
   cp .env.example .env  # or create manually

   # Add your database credentials to .env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=ekart_store
   PORT=5000
   ```

4. **Install Dependencies**

   **Backend Setup:**
   ```bash
   cd server
   npm install
   ```

   **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   ```

5. **Initialize Database**
   ```bash
   # From server directory
   cd server
   node scripts/createWishlistTable.js
   node scripts/alterOrdersTable.js
   node scripts/seedDummyProducts.js
   ```

6. **Start the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   # Server will run on http://localhost:5000
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   # Application will run on http://localhost:5173
   ```

## 📁 Project Structure

```
E_Kart/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   │   └── Navbar.jsx  # Navigation Bar
│   │   ├── pages/          # Page Components
│   │   │   ├── Home.jsx    # Product Catalog
│   │   │   ├── Cart.jsx    # Shopping Cart
│   │   │   ├── Wishlist.jsx # Wishlist Page
│   │   │   ├── Checkout.jsx # Checkout Process
│   │   │   ├── OrderHistory.jsx # Order History
│   │   │   ├── ProductDetail.jsx # Product Details
│   │   │   └── OrderSuccess.jsx # Order Confirmation
│   │   ├── services/
│   │   │   └── api.js      # API Service Layer
│   │   ├── App.jsx         # Main App Component
│   │   └── main.jsx        # Application Entry Point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js Backend
│   ├── config/
│   │   └── db.js           # Database Configuration
│   ├── controllers/        # API Controllers
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── routes/             # API Routes
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── scripts/            # Database Setup Scripts
│   │   ├── alterOrdersTable.js
│   │   ├── createWishlistTable.js
│   │   ├── seedDummyProducts.js
│   │   └── updatePricesToINR.js
│   ├── app.js              # Express App Setup
│   ├── server.js           # Server Entry Point
│   └── package.json
├── .gitignore              # Git Ignore Rules
└── README.md               # Project Documentation
```

## 📡 API Endpoints

### Products
- `GET /products` - Get all products (with search & category filters)
- `GET /products/:id` - Get product details

### Cart
- `GET /cart` - Get cart items
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item quantity
- `DELETE /cart/:id` - Remove item from cart

### Wishlist
- `GET /wishlist` - Get wishlist items
- `POST /wishlist` - Add item to wishlist
- `DELETE /wishlist/:id` - Remove item from wishlist
- `GET /wishlist/status/:product_id` - Check wishlist status

### Orders
- `GET /orders` - Get order history
- `POST /orders` - Place new order

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: `#2874f0` (Flipkart Blue)
- **Secondary**: `#fb641b` (Orange)
- **Success**: `#388e3c` (Green)
- **Background**: `#f1f3f6` (Light Gray)

### Typography
- **Primary Font**: System font stack for optimal performance
- **Headings**: Bold weights for hierarchy
- **Body Text**: Regular weight for readability

### Responsive Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Large**: 1280px+

## 🤝 Contributing

We welcome contributions to E-Kart! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Your Changes**
4. **Commit Your Changes**
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```
5. **Push to Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### Development Guidelines
- Follow the existing code style and structure
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design for all new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Inspiration**: Modern e-commerce platforms
- **Data**: Dummy product data from [DummyJSON](https://dummyjson.com/)

## 📞 Support

If you have any questions or need help with the project:

- **GitHub Issues**: Create an issue for bugs or feature requests
- **Email**: Contact the maintainers
- **Documentation**: Check the inline code comments for implementation details

---

**Happy Shopping! 🛒✨**

Built with ❤️ by [dev-SidD](https://github.com/dev-SidD)</contents>
</xai:function_call">The file c:\Users\sid25\E_Kart\README.md has been updated. Now let's commit and push this README to GitHub. 

```bash
git add README.md
git commit -m "docs: Add comprehensive README.md with setup instructions and project details"
git push origin main
```
