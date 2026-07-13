import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ScrollText } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function TermsAndConditions() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using the Sais Creation LLC (Decors and Rentals) website ("Site") or engaging our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy. If you do not agree with any part of these terms, you must not use our Site or services.

These terms apply to all visitors, users, customers, and anyone who accesses or uses our Site and services, regardless of their country of residence.`,
    },
    {
      title: '2. Services',
      content: `Sais Creation LLC (Decors and Rentals) provides event decoration services and party rental equipment. Our services include but are not limited to:

• Event and venue decoration design and setup.
• Party rental equipment and supplies.
• Custom style consultations and quotes.
• Delivery, setup, and teardown of rental items and decor.

All services are subject to availability and may vary based on location, event requirements, and scheduling.`,
    },
    {
      title: '3. Orders and Quotes',
      content: `• Requesting a Quote: Submitting a quote request through our website or WhatsApp does not constitute a binding contract. A contract is formed only when we confirm your order in writing (via email, WhatsApp, or other written communication).
• Pricing: All prices displayed on the website are indicative and may vary based on event specifics, customization requirements, delivery distance, and seasonal demand. Final pricing will be confirmed in your quote.
• Changes: Any modifications to confirmed orders must be communicated at least 7 days before the event date. We will make reasonable efforts to accommodate changes, but availability is not guaranteed.
• Minimum Orders: Certain services or rental packages may have minimum order requirements.`,
    },
    {
      title: '4. Payments',
      content: `• A non-refundable deposit may be required to confirm your booking. The deposit amount will be specified in your quote.
• The remaining balance is due as specified in the quote or invoice, typically before or on the day of the event.
• Accepted payment methods will be communicated at the time of booking.
• Late payments may result in cancellation of services or additional fees.`,
    },
    {
      title: '5. Cancellations and Refunds',
      content: `• Client Cancellations: If you cancel a confirmed order, the deposit is non-refundable. Cancellations made less than 7 days before the event may incur additional charges up to the full order amount.
• Our Cancellations: In the unlikely event that we must cancel due to circumstances beyond our control (e.g., severe weather, supplier issues, force majeure), we will provide a full refund of all payments received or offer to reschedule.
• No-Show: If we arrive at the event location and are unable to perform the service due to incorrect information provided by the client (wrong address, locked venue, etc.), the full amount remains due.`,
    },
    {
      title: '6. Rental Items',
      content: `• Care and Responsibility: Rented items must be treated with reasonable care. You are responsible for any loss, theft, or damage to rental items from the time of delivery or pickup until the time of return or collection.
• Damage Fees: Damaged, stained, or missing items will be charged at replacement or repair cost. An itemized damage assessment will be provided.
• Return: All rental items must be returned or made available for collection at the agreed time. Late returns may incur additional daily rental charges.
• Prohibited Uses: Rental items may not be sublet, loaned to third parties, or used for purposes other than the agreed event without our written consent.`,
    },
    {
      title: '7. Intellectual Property and Photo Copyright',
      content: `All content on this website — including but not limited to photographs, images, text, graphics, logos, icons, designs, layouts, and visual compositions — is the exclusive property of Sais Creation LLC (Decors and Rentals) and is protected by United States and international copyright laws, trademark laws, and other intellectual property rights.

IMPORTANT — PHOTO COPYRIGHT NOTICE:

• All photographs and images displayed on this website are original works created by or commissioned by Sais Creation LLC (Decors and Rentals) and are protected under the Copyright Act (Title 17, United States Code) and the Berne Convention for the Protection of Literary and Artistic Works.
• No photograph, image, or visual content from this website may be copied, downloaded, reproduced, republished, distributed, transmitted, displayed, modified, or used in any form or by any means — electronic, mechanical, photocopying, recording, or otherwise — without the prior express written permission of Sais Creation LLC (Decors and Rentals).
• Unauthorized use of any photograph or image constitutes copyright infringement and may result in civil and criminal penalties under applicable laws, including but not limited to the Digital Millennium Copyright Act (DMCA).
• Using our photos on social media, blogs, other websites, marketing materials, or any commercial or personal purpose without authorization is strictly prohibited.
• If you wish to use any image from this website, you must contact us in advance to obtain a written license. Licensing terms, fees, and permitted uses will be determined on a case-by-case basis.
• We actively monitor the internet for unauthorized use of our images and will pursue legal action against infringers.

Event Photography: Photographs taken by us at client events may be used by Sais Creation LLC (Decors and Rentals) for portfolio, marketing, and promotional purposes unless the client provides written notice to opt out prior to the event.`,
    },
    {
      title: '8. Website Use',
      content: `You agree not to:

• Use the Site for any unlawful purpose or in violation of any applicable local, state, national, or international law.
• Copy, reproduce, distribute, or create derivative works from any content on this Site without express written permission.
• Attempt to gain unauthorized access to any portion of the Site, other accounts, or any systems or networks connected to the Site.
• Use automated tools (bots, scrapers, crawlers) to extract content or data from the Site without our written consent.
• Upload or transmit viruses, malware, or any harmful code.
• Impersonate any person or entity or misrepresent your affiliation with any person or entity.`,
    },
    {
      title: '9. User Accounts',
      content: `• You are responsible for maintaining the confidentiality of your account credentials.
• You agree to provide accurate and complete information when creating an account.
• You are responsible for all activity that occurs under your account.
• We reserve the right to suspend or terminate accounts that violate these terms or are inactive for extended periods.
• You must notify us immediately if you suspect unauthorized use of your account.`,
    },
    {
      title: '10. Limitation of Liability',
      content: `To the fullest extent permitted by applicable law:

• Our total liability for any claim arising from or related to our services shall not exceed the total amount you paid for the specific service giving rise to the claim.
• We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill.
• We are not liable for delays, failures, or interruptions in service caused by events beyond our reasonable control, including but not limited to natural disasters, severe weather, pandemics, acts of government, labor disputes, supplier failures, or other force majeure events.
• We are not responsible for minor variations in decor setup from reference images, as each event space and setup condition is unique.`,
    },
    {
      title: '11. Indemnification',
      content: `You agree to indemnify, defend, and hold harmless Sais Creation LLC (Decors and Rentals), its owners, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney's fees) arising out of or related to:

• Your use of our Site or services.
• Your violation of these Terms and Conditions.
• Your violation of any rights of a third party.
• Any content or information you provide to us.`,
    },
    {
      title: '12. Dispute Resolution',
      content: `• Governing Law: These Terms and Conditions are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict-of-law provisions.
• Informal Resolution: Before filing any formal legal proceedings, you agree to first attempt to resolve any dispute informally by contacting us. We will endeavor to resolve the matter within 30 days.
• Arbitration: Any dispute that cannot be resolved informally shall be resolved by binding arbitration in Santa Clara County, California, in accordance with the rules of the American Arbitration Association.
• Class Action Waiver: You agree that any dispute resolution proceedings will be conducted on an individual basis and not as part of a class, consolidated, or representative action.`,
    },
    {
      title: '13. Severability',
      content: `If any provision of these Terms and Conditions is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.`,
    },
    {
      title: '14. Entire Agreement',
      content: `These Terms and Conditions, together with our Privacy Policy and any specific order agreements, constitute the entire agreement between you and Sais Creation LLC (Decors and Rentals) regarding your use of the Site and services, and supersede all prior or contemporaneous communications, whether electronic, oral, or written.`,
    },
    {
      title: '15. Changes to These Terms',
      content: `We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page with an updated "Last Updated" date. Your continued use of the Site or services after any changes constitutes acceptance of the revised terms. We encourage you to review these terms periodically.`,
    },
    {
      title: '16. Contact Us',
      content: `If you have any questions about these Terms and Conditions, please contact us:

• Business Name: Sais Creation LLC (Decors and Rentals)
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
              <ScrollText className="w-5 h-5 text-[#B07D3F]" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118]">Terms &amp; Conditions</h1>
          </motion.div>

          <motion.p variants={fadeUp} className="font-body text-[14px] text-[#2B2118]/50 mb-12">
            Last Updated: July 6, 2026
          </motion.p>

          <motion.p variants={fadeUp} className="font-body text-[15px] text-[#2B2118]/70 leading-relaxed mb-10">
            Welcome to Sais Creation LLC (Decors and Rentals). These Terms and Conditions govern your use of our website and services. By accessing our website or engaging our services, you agree to comply with and be bound by the following terms. Please read them carefully.
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
