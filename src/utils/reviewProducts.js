// Products created by the two legacy demo-data scripts. Older genuine admin
// products predate the adminCreated flag, so names are used only for migration.
const LEGACY_DEMO_PRODUCT_NAMES = new Set([
  'Rainbow Balloon Arch Kit',
  'Happy Birthday Banner Set',
  'Birthday Table Centerpiece',
  'Floral Mandap Setup',
  'Wedding Stage Backdrop',
  'Aisle Runner & Petal Setup',
  'Gender Reveal Decor Kit',
  'Oh Baby Backdrop',
  'Baby Shower Table Setup',
  'Golden Anniversary Decor',
  'Love Wall Installation',
  'Anniversary Cake Table',
  'Diwali Light Decor',
  'Christmas Tree Setup',
  'Holi Color Splash Decor',
  'Chiavari Chair Set (50 pcs)',
  'Round Banquet Table (10 pcs)',
  'Cocktail High Table (5 pcs)',
  'Grand Wedding Shamiana',
  'Garden Canopy (20x20ft)',
  'Party Pop-up Tent (10x10ft)',
  'Fairy Light Package (500ft)',
  'LED Uplighting Set (20 pcs)',
  'Crystal Chandelier Rental',
  'PA System (500W)',
  'DJ Setup Package',
  'Wireless Mic Set (4 pcs)',
  'Modular Stage Platform',
  'Backdrop Frame & Draping',
  'Red Carpet Package',
  'Golden Balloon Arch',
  'Pastel Rainbow Garland',
  'Chrome Balloon Bouquet',
  'Royal Birthday Package',
  'Kids Theme Party Kit',
  'Neon Glow Birthday Setup',
  'Elegant Wedding Mandap',
  'Reception Stage Decor',
  'Car Decoration',
  'Oh Baby Shower Package',
  'Gender Reveal Box',
  'Silver Jubilee Package',
  'Romantic Candlelight Setup',
])

export function isAdminReviewProduct(product) {
  if (product.showInReviewDropdown === false) return false
  if (product.adminCreated === true) return true
  return !LEGACY_DEMO_PRODUCT_NAMES.has((product.name || '').trim())
}
