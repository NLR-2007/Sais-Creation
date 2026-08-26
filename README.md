# Decors by Sai

![US Client Project](https://img.shields.io/badge/Client-United%20States-blue)
![Project Status](https://img.shields.io/badge/Status-Live-success)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB)
![Build Tool](https://img.shields.io/badge/Build-Vite-646CFF)
![Hosting](https://img.shields.io/badge/Hosting-Vercel-black)
![Backend](https://img.shields.io/badge/Backend-Firebase-orange)

> A production website developed for a United States–based event decoration and rental business.

## Live Website

🌐 [https://decorsbysai.com](https://decorsbysai.com)

## Project Overview

Decors by Sai is a modern event-decoration and rental platform created for a US-based client. It allows customers to explore decoration services, browse rental products, view completed events, request quotations, and manage their accounts through a responsive web interface.

The platform was designed to provide a professional online presence and simplify customer enquiries for weddings, birthdays, engagements, baby showers, cultural celebrations, corporate events, and other special occasions.

## Main Features

- Browse event-decoration services
- Explore party and event rentals
- View decoration portfolios and galleries
- Browse available products
- Add selected products to the cart
- Request personalized quotations
- Customer registration and login
- Mobile, tablet, and desktop support
- SEO-friendly pages and metadata
- Secure Firebase integration
- Serverless functionality
- Production deployment through Vercel

## Application Pages

- Home
- Rentals
- Decors
- Gallery
- Products
- Cart
- Quote Request
- Login
- Registration

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Responsive Web Design

### Backend and Services

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Serverless Functions

### Deployment

- GitHub for source-code management
- Vercel for hosting and deployment
- Custom domain configuration
- Automatic deployment from the main branch

## SEO Implementation

The project includes:

- XML sitemap
- Robots.txt configuration
- Search-engine-friendly routes
- Page metadata
- Structured data
- Breadcrumb markup
- Review snippets
- Google Search Console integration
- Custom-domain indexing

## Project Structure

```text
Sais-Creation/
├── functions/          # Serverless backend functions
├── public/             # Public assets, sitemap and robots.txt
├── scripts/            # One-off maintenance scripts (not part of the build)
├── src/                # React application source code
├── firebase.json       # Firebase configuration
├── firestore.rules     # Firestore security rules
├── storage.rules       # Firebase Storage rules
├── index.html          # Main HTML entry point
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment configuration
└── vite.config.js      # Vite configuration
```

## Performance Notes

### Image pipeline

Photos are re-encoded in the browser (`src/utils/compressImage.js`) before upload and
stored through `src/utils/uploadImage.js`, which sets a long-lived `Cache-Control`
header. Two rules matter here:

- **Never trust `canvas.toBlob(cb, 'image/webp')`.** Safari and some Android WebViews
  ignore an unsupported type and silently return a PNG. An earlier version renamed the
  result `.webp` regardless, so phone uploads were stored as 2-3 MB PNGs. The compressor
  now checks `blob.type` and re-encodes until the file fits a byte budget.
- **Firebase Storage defaults to `Cache-Control: private, max-age=0`**, so photos are
  re-downloaded on every page view unless the header is set at upload time.

### Repairing photos uploaded before that fix

`scripts/optimize-storage-images.mjs` rewrites oversized objects in place, keeping the
same path and download token, so URLs already stored in Firestore keep working:

```bash
cd scripts
npm install
# PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS = "C:/path/to/serviceAccount.json"
node optimize-storage-images.mjs --scan       # metadata only, no downloads
node optimize-storage-images.mjs --apply      # rewrite for real
```

The script is idempotent: anything it has already repaired (WebP carrying our cache
header) is skipped, so re-running it after adding photos only touches the new ones.
Photos keep their original pixel dimensions unless they exceed 2000px — the saving
comes from re-encoding to WebP, not from shrinking.

Get the key from Firebase console → Project settings → Service accounts → Generate new
private key. Run the dry run first, then `--apply --limit 20` as a trial batch.

### Firestore reads

Public pages read collections through `src/utils/firestoreCache.js`, which keeps results
in memory for five minutes so moving between the collection, a product and back does not
refetch the (large) products collection each time. Admin screens deliberately bypass the
cache and always read live data. Pages sharing a cache key must use the identical query.
