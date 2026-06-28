import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import FloatingCart from './components/FloatingCart'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductsPage from './pages/ProductsPage'
import GalleryPage from './pages/GalleryPage'
import CartPage from './pages/CartPage'
import QuotePage from './pages/QuotePage'
import ProductDetail from './pages/ProductDetail'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Categories from './pages/admin/Categories'
import Products from './pages/admin/Products'
import Gallery from './pages/admin/Gallery'
import Users from './pages/admin/Users'
import Orders from './pages/admin/Orders'
import SiteContent from './pages/admin/SiteContent'
import SeedData from './pages/SeedData'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/decors" element={<ProductsPage pageType="decors" />} />
            <Route path="/rentals" element={<ProductsPage pageType="rentals" />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/seed" element={<SeedData />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="decors" element={<Products sectionType="decors" />} />
              <Route path="rentals" element={<Products sectionType="rentals" />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="users" element={<Users />} />
              <Route path="orders" element={<Orders />} />
              <Route path="content" element={<SiteContent />} />
            </Route>
          </Routes>
          <FloatingCart />
          <FloatingWhatsApp />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
