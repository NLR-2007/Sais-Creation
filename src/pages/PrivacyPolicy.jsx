import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const sections = [
    {
      title: '1. Information We Collect',
      content: `When you use our website or services, we may collect the following types of information:

• Personal Information: Name, email address, phone number, and mailing address provided when you register, place an order, or contact us.
• Account Information: Login credentials and account preferences.
• Order Information: Details about the products and services you request, including event dates, venues, and style preferences.
• Communication Data: Messages sent through our contact forms, WhatsApp, email, or other communication channels.
• Usage Data: Browser type, device information, pages visited, and interaction patterns collected automatically through cookies and similar technologies.
• Payment Information: We do not store credit card numbers or sensitive financial data on our servers. All payment processing is handled by secure third-party payment processors.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Process and fulfill your orders and service requests.
• Communicate with you about your orders, quotes, and inquiries.
• Send order confirmations and updates via WhatsApp, email, or SMS.
• Improve our website, products, and services.
• Personalize your experience and provide relevant recommendations.
• Comply with legal obligations and resolve disputes.
• Prevent fraud and ensure the security of our platform.

We will never sell, rent, or trade your personal information to third parties for marketing purposes.`,
    },
    {
      title: '3. Cookies and Tracking Technologies',
      content: `Our website uses cookies and similar technologies to enhance your browsing experience. These may include:

• Essential Cookies: Required for the website to function properly (e.g., session management, authentication).
• Analytics Cookies: Help us understand how visitors interact with our website so we can improve it.

You can manage your cookie preferences through your browser settings. Disabling certain cookies may affect your ability to use some features of our website.`,
    },
    {
      title: '4. Data Sharing and Disclosure',
      content: `We may share your information only in the following circumstances:

• Service Providers: With trusted third-party vendors who assist us in operating our website, processing orders, or delivering services (e.g., hosting providers, messaging platforms). These providers are contractually obligated to protect your data.
• Legal Requirements: When required by law, regulation, legal process, or enforceable governmental request.
• Business Transfers: In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
• With Your Consent: When you have given explicit permission for a specific use.`,
    },
    {
      title: '5. Data Security',
      content: `We implement industry-standard security measures to protect your personal information, including:

• Encrypted data transmission (SSL/TLS).
• Secure authentication mechanisms.
• Regular security assessments and updates.

While we take reasonable precautions, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.`,
    },
    {
      title: '6. Data Retention',
      content: `We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. When your data is no longer needed, we will securely delete or anonymize it.`,
    },
    {
      title: '7. Your Rights',
      content: `Depending on your location, you may have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you.
• Correction: Request correction of inaccurate or incomplete data.
• Deletion: Request deletion of your personal data, subject to legal retention requirements.
• Portability: Request your data in a structured, commonly used format.
• Opt-Out: Unsubscribe from marketing communications at any time.
• Restriction: Request that we limit processing of your data in certain circumstances.

To exercise any of these rights, please contact us using the information provided below.`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 16, we will take steps to delete it promptly. If you believe a child has provided us with personal information, please contact us immediately.`,
    },
    {
      title: '9. International Data Transfers',
      content: `If you access our website from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our services, you consent to the transfer of your information to the United States, which may have different data protection laws than your country of residence.`,
    },
    {
      title: '10. Third-Party Links',
      content: `Our website may contain links to third-party websites or services (e.g., Instagram, WhatsApp). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.`,
    },
    {
      title: '11. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. The updated policy will be posted on this page with a revised "Last Updated" date. We encourage you to review this page periodically.`,
    },
    {
      title: '12. Contact Us',
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

• Business Name: Sais Creations Decor Service & Party Rentals LLC
• Email: saiscreation2018@gmail.com
• Phone: +1 (408) 387-4854
• Address: San Jose, California, United States`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div variants={fadeUp} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#B07D3F] hover:text-[#7B2D43] transition-colors duration-300 mb-8">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back to Home
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/30 bg-[#B07D3F]/[0.06]" />
              <Shield className="w-5 h-5 text-[#B07D3F]" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118]">Privacy Policy</h1>
          </motion.div>

          <motion.p variants={fadeUp} className="font-body text-[14px] text-[#2B2118]/50 mb-12">
            Last Updated: July 6, 2026
          </motion.p>

          <motion.p variants={fadeUp} className="font-body text-[15px] text-[#2B2118]/70 leading-relaxed mb-10">
            Sais Creations Decor Service & Party Rentals LLC ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this policy carefully. By using our website, you agree to the practices described herein.
          </motion.p>

          {sections.map((section) => (
            <motion.div key={section.title} variants={fadeUp} className="mb-10">
              <h2 className="font-display text-xl font-semibold text-[#2B2118] mb-4">{section.title}</h2>
              <p className="font-body text-[14px] text-[#2B2118]/65 leading-[1.85] whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
