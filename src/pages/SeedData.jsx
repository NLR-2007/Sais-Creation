import { useState } from 'react'
import { db } from '../config/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { Sparkles, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'

const DECOR_CATEGORIES = [
  { name: 'Birthday Decorations', type: 'decors', order: 1 },
  { name: 'Wedding Decor', type: 'decors', order: 2 },
  { name: 'Baby Shower', type: 'decors', order: 3 },
  { name: 'Anniversary Decor', type: 'decors', order: 4 },
  { name: 'Festival & Holiday', type: 'decors', order: 5 },
]

const RENTAL_CATEGORIES = [
  { name: 'Chairs & Tables', type: 'rentals', order: 1 },
  { name: 'Tents & Canopies', type: 'rentals', order: 2 },
  { name: 'Lighting Equipment', type: 'rentals', order: 3 },
  { name: 'Sound Systems', type: 'rentals', order: 4 },
  { name: 'Stage & Backdrop', type: 'rentals', order: 5 },
]

const PRODUCTS_BY_CATEGORY = {
  'Birthday Decorations': [
    { name: 'Rainbow Balloon Arch Kit', desc: 'Stunning rainbow theme balloon arch with metallic gold accents, includes 120+ balloons and arch strip', price: '₹2,500', tag: 'Popular' },
    { name: 'Happy Birthday Banner Set', desc: 'Premium gold foil letter banner with matching tassels and star garland', price: '₹800', tag: 'New' },
    { name: 'Birthday Table Centerpiece', desc: 'Elegant floral centerpiece with custom number topper and confetti', price: '₹1,200', tag: '' },
  ],
  'Wedding Decor': [
    { name: 'Floral Mandap Setup', desc: 'Traditional mandap beautifully draped with fresh jasmine and marigold flowers', price: '₹35,000', tag: 'Premium' },
    { name: 'Wedding Stage Backdrop', desc: 'Luxurious stage backdrop with fairy lights, draping fabric, and floral arrangements', price: '₹25,000', tag: 'Popular' },
    { name: 'Aisle Runner & Petal Setup', desc: 'White silk aisle runner with fresh rose petal arrangements and lantern accents', price: '₹8,000', tag: '' },
  ],
  'Baby Shower': [
    { name: 'Gender Reveal Decor Kit', desc: 'Complete gender reveal setup with balloon garland, confetti cannons, and photo props', price: '₹3,500', tag: 'Trending' },
    { name: 'Oh Baby Backdrop', desc: 'Custom printed "Oh Baby" backdrop with matching balloon frame in pastel colors', price: '₹4,000', tag: 'Popular' },
    { name: 'Baby Shower Table Setup', desc: 'Themed table decor with centerpieces, cake stand, and favor boxes', price: '₹2,800', tag: '' },
  ],
  'Anniversary Decor': [
    { name: 'Golden Anniversary Decor', desc: 'Elegant gold themed backdrop with "Happy Anniversary" signage and table setup', price: '₹12,000', tag: 'Premium' },
    { name: 'Love Wall Installation', desc: 'Romantic photo wall with fairy lights, fresh flowers, and customizable love quotes', price: '₹8,500', tag: 'Popular' },
    { name: 'Anniversary Cake Table', desc: 'Beautifully decorated cake table with floral accents and candle arrangements', price: '₹3,000', tag: '' },
  ],
  'Festival & Holiday': [
    { name: 'Diwali Light Decor', desc: 'Traditional diya arrangements with LED string lights, rangoli setup, and floral toran', price: '₹6,000', tag: 'Seasonal' },
    { name: 'Christmas Tree Setup', desc: 'Fully decorated 7ft Christmas tree with premium ornaments, lights, and star topper', price: '₹9,500', tag: 'Seasonal' },
    { name: 'Holi Color Splash Decor', desc: 'Vibrant color themed party setup with rainbow draping and splash zone accessories', price: '₹5,000', tag: 'Seasonal' },
  ],
  'Chairs & Tables': [
    { name: 'Chiavari Chair Set (50 pcs)', desc: 'Premium gold Chiavari chairs with cushion pads, perfect for wedding receptions', price: '₹15,000/day', tag: 'Popular' },
    { name: 'Round Banquet Table (10 pcs)', desc: '6ft round banquet tables with premium white tablecloths included', price: '₹8,000/day', tag: '' },
    { name: 'Cocktail High Table (5 pcs)', desc: 'Bar height cocktail tables with lycra stretch covers in multiple colors', price: '₹4,000/day', tag: 'New' },
  ],
  'Tents & Canopies': [
    { name: 'Grand Wedding Shamiana', desc: 'Large decorated tent for 200+ guests with lining, chandeliers, and side drapes', price: '₹45,000/day', tag: 'Premium' },
    { name: 'Garden Canopy (20x20ft)', desc: 'Elegant white canopy for outdoor garden events with fairy light ceiling', price: '₹18,000/day', tag: 'Popular' },
    { name: 'Party Pop-up Tent (10x10ft)', desc: 'Portable instant canopy tent for small gatherings and birthday parties', price: '₹3,500/day', tag: '' },
  ],
  'Lighting Equipment': [
    { name: 'Fairy Light Package (500ft)', desc: '500ft warm white fairy lights for ceiling draping, wall décor, or tree wrapping', price: '₹5,000/day', tag: 'Popular' },
    { name: 'LED Uplighting Set (20 pcs)', desc: 'Wireless battery-powered LED uplights in any color with DMX control', price: '₹12,000/day', tag: 'New' },
    { name: 'Crystal Chandelier Rental', desc: 'Hanging crystal chandelier for centerpiece or dance floor — includes installation', price: '₹8,000/day', tag: 'Premium' },
  ],
  'Sound Systems': [
    { name: 'PA System (500W)', desc: 'Professional 500W PA system with 2 speakers, mixer, and wireless microphone', price: '₹6,000/day', tag: 'Popular' },
    { name: 'DJ Setup Package', desc: 'Complete DJ booth with dual speakers, subwoofer, mixer, and LED party lights', price: '₹15,000/day', tag: 'Premium' },
    { name: 'Wireless Mic Set (4 pcs)', desc: 'Set of 4 UHF wireless handheld microphones with receiver, perfect for speeches', price: '₹3,000/day', tag: '' },
  ],
  'Stage & Backdrop': [
    { name: 'Modular Stage Platform', desc: '12x8ft raised platform stage with skirting, carpet, and safety railings', price: '₹20,000/day', tag: 'Popular' },
    { name: 'Backdrop Frame & Draping', desc: 'Adjustable 10x10ft backdrop stand with premium draping fabric in your color choice', price: '₹7,000/day', tag: '' },
    { name: 'Red Carpet Package', desc: '30ft red carpet with velvet rope barriers, stanchions, and step-and-repeat banner', price: '₹10,000/day', tag: 'Premium' },
  ],
}

export default function SeedData() {
  const [status, setStatus] = useState('idle')
  const [log, setLog] = useState([])

  const addLog = (msg) => setLog((prev) => [...prev, msg])

  const seed = async () => {
    setStatus('seeding')
    setLog([])

    try {
      const existingCats = await getDocs(collection(db, 'categories'))
      if (!existingCats.empty) {
        addLog(`Clearing ${existingCats.size} existing categories...`)
        for (const d of existingCats.docs) {
          await deleteDoc(doc(db, 'categories', d.id))
        }
        addLog('  ✓ Old categories deleted')
      }

      const existingProds = await getDocs(collection(db, 'products'))
      if (!existingProds.empty) {
        addLog(`Clearing ${existingProds.size} existing products...`)
        for (const d of existingProds.docs) {
          await deleteDoc(doc(db, 'products', d.id))
        }
        addLog('  ✓ Old products deleted')
      }

      addLog('Creating Decor categories...')
      const categoryIdMap = {}

      for (const cat of DECOR_CATEGORIES) {
        const docRef = await addDoc(collection(db, 'categories'), {
          ...cat,
          imageUrl: '',
          createdAt: serverTimestamp(),
        })
        categoryIdMap[cat.name] = docRef.id
        addLog(`  ✓ ${cat.name}`)
      }

      addLog('Creating Rental categories...')
      for (const cat of RENTAL_CATEGORIES) {
        const docRef = await addDoc(collection(db, 'categories'), {
          ...cat,
          imageUrl: '',
          createdAt: serverTimestamp(),
        })
        categoryIdMap[cat.name] = docRef.id
        addLog(`  ✓ ${cat.name}`)
      }

      addLog('Creating products...')
      let productCount = 0
      for (const [catName, products] of Object.entries(PRODUCTS_BY_CATEGORY)) {
        const categoryId = categoryIdMap[catName]
        if (!categoryId) continue
        for (const product of products) {
          await addDoc(collection(db, 'products'), {
            name: product.name,
            desc: product.desc,
            price: product.price,
            tag: product.tag,
            imageUrl: '',
            categoryId,
            featured: product.tag === 'Popular' || product.tag === 'Premium',
            photos: [],
            createdAt: serverTimestamp(),
          })
          productCount++
        }
        addLog(`  ✓ ${catName} — ${products.length} products`)
      }

      addLog(`\nDone! Created ${DECOR_CATEGORIES.length + RENTAL_CATEGORIES.length} categories and ${productCount} products.`)
      setStatus('done')
    } catch (err) {
      addLog(`✗ Error: ${err.message}`)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3EADC] border border-[#B07D3F]/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#7B2D43]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#2B2118] mb-2">Seed Demo Data</h1>
          <p className="font-body text-[#2B2118]/50">Add dummy categories &amp; products to Firestore for testing</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#B07D3F]/15 shadow-[0_4px_20px_rgba(59,31,43,0.05)] p-6">
          <div className="mb-4 text-sm font-body text-[#2B2118]/60">
            <p className="mb-2 font-semibold text-[#2B2118]">This will create:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>5 Decor categories (Birthday, Wedding, Baby Shower, Anniversary, Festival)</li>
              <li>5 Rental categories (Chairs, Tents, Lighting, Sound, Stage)</li>
              <li>3 products per category (30 total)</li>
            </ul>
          </div>

          {status === 'idle' && (
            <button
              onClick={seed}
              className="w-full py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[12px] tracking-[0.2em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Seed Data Now
            </button>
          )}

          {status === 'seeding' && (
            <div className="flex items-center justify-center gap-2 py-3.5 text-[#7B2D43]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-accent text-[12px] tracking-[0.15em] uppercase">Seeding...</span>
            </div>
          )}

          {status === 'done' && (
            <div className="flex items-center justify-center gap-2 py-3.5 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-accent text-[12px] tracking-[0.15em] uppercase">Complete</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center justify-center gap-2 py-3.5 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-accent text-[12px] tracking-[0.15em] uppercase">Error occurred</span>
            </div>
          )}

          {log.length > 0 && (
            <div className="mt-4 bg-[#FBF7F0] rounded-xl border border-[#B07D3F]/10 p-4 max-h-72 overflow-y-auto">
              <pre className="text-xs font-mono text-[#2B2118]/70 whitespace-pre-wrap">{log.join('\n')}</pre>
            </div>
          )}

          {status === 'done' && (
            <div className="mt-4 flex gap-3">
              <Link to="/decors" className="flex-1 text-center py-3 rounded-full border border-[#7B2D43]/25 text-[#7B2D43] font-accent text-[11px] tracking-[0.15em] uppercase hover:bg-[#7B2D43]/5 transition-all duration-300">
                View Decors
              </Link>
              <Link to="/rentals" className="flex-1 text-center py-3 rounded-full border border-[#7B2D43]/25 text-[#7B2D43] font-accent text-[11px] tracking-[0.15em] uppercase hover:bg-[#7B2D43]/5 transition-all duration-300">
                View Rentals
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
