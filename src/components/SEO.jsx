import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Sais Creation'
const BASE_URL = 'https://saiscreation.com'
const DEFAULT_DESCRIPTION = 'Premium custom event decor and high-quality rental props for weddings, birthdays, baby showers, corporate events & more in Mountain House, CA and the Bay Area.'

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  type = 'website',
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | #1 Party Decor & Rental Services in Mountain House, CA`
  const url = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
