const admin = require('firebase-admin')
const os = require('os')
const path = require('path')
const fs = require('fs')

const PROJECT_ID = 'decor-by-saiscreations-l-ffacd'

// Firebase CLI OAuth client (public, embedded in firebase-tools source)
const FIREBASE_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com'
const FIREBASE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi'

function getFirebaseCredential() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  const refreshToken = config.tokens?.refresh_token
  if (!refreshToken) throw new Error('No Firebase CLI refresh token found. Run: firebase login')

  const adcPath = path.join(os.tmpdir(), 'firebase-adc.json')
  fs.writeFileSync(adcPath, JSON.stringify({
    type: 'authorized_user',
    client_id: FIREBASE_CLIENT_ID,
    client_secret: FIREBASE_CLIENT_SECRET,
    refresh_token: refreshToken,
  }))
  process.env.GOOGLE_APPLICATION_CREDENTIALS = adcPath
  return adcPath
}

const IMG = (seed, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`

async function seed() {
  const adcPath = getFirebaseCredential()
  console.log('Using Firebase CLI credentials\n')

  admin.initializeApp({ projectId: PROJECT_ID })
  const db = admin.firestore()

  console.log('Seeding categories...')

  const categories = [
    { name: 'Balloon Decorations', imageUrl: IMG('balloons', 600, 400), order: 0 },
    { name: 'Birthday Setups',     imageUrl: IMG('birthday-cake', 600, 400), order: 1 },
    { name: 'Wedding Decor',       imageUrl: IMG('wedding-flowers', 600, 400), order: 2 },
    { name: 'Baby Shower',         imageUrl: IMG('baby-pink', 600, 400), order: 3 },
    { name: 'Anniversary Specials', imageUrl: IMG('anniversary-gold', 600, 400), order: 4 },
  ]

  const catRefs = {}
  for (const cat of categories) {
    const ref = await db.collection('categories').add({
      ...cat,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    catRefs[cat.name] = ref.id
    console.log(`  + ${cat.name}`)
  }

  console.log('\nSeeding products...')

  const products = [
    {
      name: 'Golden Balloon Arch',
      desc: 'Stunning golden balloon arch with metallic and confetti balloons. Perfect for grand entrances and photo backdrops.',
      price: '₹3,499',
      tag: 'Bestseller',
      imageUrl: IMG('golden-arch', 600, 450),
      categoryId: catRefs['Balloon Decorations'],
    },
    {
      name: 'Pastel Rainbow Garland',
      desc: 'Delicate pastel balloon garland in soft pink, lavender, mint, and peach. Ideal for baby showers and brunches.',
      price: '₹2,199',
      tag: 'New',
      imageUrl: IMG('pastel-rainbow', 600, 450),
      categoryId: catRefs['Balloon Decorations'],
    },
    {
      name: 'Chrome Balloon Bouquet',
      desc: 'Luxurious chrome balloon bouquet in rose gold, silver, and champagne. Comes with weight and ribbon.',
      price: '₹899',
      tag: '',
      imageUrl: IMG('chrome-bouquet', 600, 450),
      categoryId: catRefs['Balloon Decorations'],
    },
    {
      name: 'Royal Birthday Package',
      desc: 'Complete birthday setup with backdrop, balloon garland, number foils, table centerpieces, and LED lights.',
      price: '₹8,999',
      tag: 'Premium',
      imageUrl: IMG('royal-birthday', 600, 450),
      categoryId: catRefs['Birthday Setups'],
    },
    {
      name: 'Kids Theme Party Kit',
      desc: 'Fun-filled party setup with character cutouts, themed balloons, banners, and a candy station backdrop.',
      price: '₹5,499',
      tag: 'Popular',
      imageUrl: IMG('kids-party', 600, 450),
      categoryId: catRefs['Birthday Setups'],
    },
    {
      name: 'Neon Glow Birthday Setup',
      desc: 'Vibrant neon-themed party decor with UV balloons, glow sticks, LED name board, and blacklight backdrop.',
      price: '₹6,999',
      tag: 'Trending',
      imageUrl: IMG('neon-party', 600, 450),
      categoryId: catRefs['Birthday Setups'],
    },
    {
      name: 'Elegant Wedding Mandap',
      desc: 'Exquisite floral mandap with white and blush drapes, fairy lights, and fresh flower arrangements.',
      price: '₹45,000',
      tag: 'Premium',
      imageUrl: IMG('wedding-mandap', 600, 450),
      categoryId: catRefs['Wedding Decor'],
    },
    {
      name: 'Reception Stage Decor',
      desc: 'Grand reception stage with floral walls, chandeliers, draped fabric, and ambient warm lighting.',
      price: '₹35,000',
      tag: '',
      imageUrl: IMG('reception-stage', 600, 450),
      categoryId: catRefs['Wedding Decor'],
    },
    {
      name: 'Car Decoration',
      desc: 'Beautiful wedding car decoration with fresh flowers, ribbons, and "Just Married" signage.',
      price: '₹4,500',
      tag: '',
      imageUrl: IMG('wedding-car', 600, 450),
      categoryId: catRefs['Wedding Decor'],
    },
    {
      name: 'Oh Baby Shower Package',
      desc: 'Charming baby shower setup with "Oh Baby" balloon letters, pastel garland, dessert table, and photo props.',
      price: '₹7,499',
      tag: 'Bestseller',
      imageUrl: IMG('oh-baby', 600, 450),
      categoryId: catRefs['Baby Shower'],
    },
    {
      name: 'Gender Reveal Box',
      desc: 'Surprise gender reveal box filled with pink or blue balloons, confetti poppers, and decorative ribbons.',
      price: '₹1,999',
      tag: 'New',
      imageUrl: IMG('gender-reveal', 600, 450),
      categoryId: catRefs['Baby Shower'],
    },
    {
      name: 'Silver Jubilee Package',
      desc: 'Elegant 25th anniversary celebration package with silver balloon garland, photo timeline, and cake table setup.',
      price: '₹12,999',
      tag: 'Premium',
      imageUrl: IMG('silver-jubilee', 600, 450),
      categoryId: catRefs['Anniversary Specials'],
    },
    {
      name: 'Romantic Candlelight Setup',
      desc: 'Intimate anniversary dinner setup with candles, rose petals, fairy lights, and a beautifully draped cabana.',
      price: '₹9,999',
      tag: 'Popular',
      imageUrl: IMG('candlelight', 600, 450),
      categoryId: catRefs['Anniversary Specials'],
    },
    {
      name: 'Golden Anniversary Decor',
      desc: 'Luxurious 50th anniversary decor with gold foil balloons, flower walls, and a custom photo booth backdrop.',
      price: '₹18,500',
      tag: '',
      imageUrl: IMG('golden-anniversary', 600, 450),
      categoryId: catRefs['Anniversary Specials'],
    },
  ]

  for (const product of products) {
    await db.collection('products').add({
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`  + ${product.name}`)
  }

  console.log('\nSeeding gallery...')

  const gallery = [
    { label: 'Grand Wedding Stage',          imageUrl: IMG('gallery-wedding-stage', 800, 600) },
    { label: 'Pink Birthday Bash',            imageUrl: IMG('gallery-pink-birthday', 800, 1000) },
    { label: 'Balloon Tunnel Entrance',       imageUrl: IMG('gallery-balloon-tunnel', 800, 800) },
    { label: 'Rustic Baby Shower',            imageUrl: IMG('gallery-rustic-baby', 800, 600) },
    { label: 'Fairy Light Canopy',            imageUrl: IMG('gallery-fairy-lights', 800, 1100) },
    { label: 'Outdoor Garden Party',          imageUrl: IMG('gallery-garden-party', 800, 700) },
    { label: 'Luxury Engagement Setup',       imageUrl: IMG('gallery-engagement', 800, 800) },
    { label: 'Candy Station & Dessert Table', imageUrl: IMG('gallery-candy-table', 800, 600) },
    { label: 'Flower Wall Backdrop',          imageUrl: IMG('gallery-flower-wall', 800, 1000) },
    { label: 'Haldi Ceremony Decor',          imageUrl: IMG('gallery-haldi', 800, 700) },
    { label: 'Corporate Event Setup',         imageUrl: IMG('gallery-corporate', 800, 600) },
    { label: 'Sangeet Night Decor',           imageUrl: IMG('gallery-sangeet', 800, 900) },
  ]

  for (const img of gallery) {
    await db.collection('gallery').add({
      ...img,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log(`  + ${img.label}`)
  }

  // Cleanup temp credentials file
  try { fs.unlinkSync(adcPath) } catch {}

  console.log('\n=== Seeding complete! ===')
  console.log(`  ${categories.length} categories`)
  console.log(`  ${products.length} products`)
  console.log(`  ${gallery.length} gallery images`)
  console.log('\nRefresh your browser to see the data.')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
