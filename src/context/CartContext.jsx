import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const STORAGE_KEY = 'sais-creation-cart'

function loadCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev
      return [...prev, { id: product.id, name: product.name, imageUrl: product.imageUrl || '', price: product.price || '', categoryId: product.categoryId || '' }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const isInCart = (productId) => cart.some((item) => item.id === productId)

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart, clearCart, cartCount: cart.length }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
