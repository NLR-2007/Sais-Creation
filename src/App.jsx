import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
const FloatingWhatsApp = lazy(() => import('./components/FloatingWhatsApp'))
const Home = lazy(() => import('./pages/Home'))

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const QuotePage = lazy(() => import('./pages/QuotePage'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Products = lazy(() => import('./pages/admin/Products'))
const Gallery = lazy(() => import('./pages/admin/Gallery'))
const Users = lazy(() => import('./pages/admin/Users'))
const Orders = lazy(() => import('./pages/admin/Orders'))
const SiteContent = lazy(() => import('./pages/admin/SiteContent'))
const Reviews = lazy(() => import('./pages/admin/Reviews'))
const RequestQuote = lazy(() => import('./pages/admin/RequestQuote'))
const SeedData = lazy(() => import('./pages/SeedData'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#B07D3F]/30 border-t-[#7B2D43] rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
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
                <Route path="request-quote" element={<RequestQuote />} />
                <Route path="content" element={<SiteContent />} />
                <Route path="reviews" element={<Reviews />} />
              </Route>
            </Routes>
          </Suspense>
          <FloatingWhatsApp />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
