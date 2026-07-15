import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ScrollText } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const rentalSections = [
  { title: 'Reservation & Payment', items: ['A non-refundable booking deposit is required to reserve rental items.', 'The remaining balance must be paid before pickup.', 'Rental items are reserved only after payment confirmation.'] },
  { title: 'Rental Return Time Policy & Delayed Rental Items Policy', items: ['All rental items must be returned within 24 hours after the event or pickup date/time, unless a different return timeline has been agreed upon and confirmed through WhatsApp communication.', 'Clients are responsible for returning all rental items on time and in the same condition as received, as the same items may be reserved for another event.', 'Any delay in returning items without prior approval may result in late return charges and may affect availability for other scheduled events.', 'Sais Creations LLC (Party Rentals & Decor Services) reserves the right to charge additional fees for items kept beyond the agreed rental period.', 'If a client fails to return rental items on time and the delay affects another customer’s reservation, the client may be responsible for additional costs, including replacement rental costs, compensation, rush arrangements, or other expenses caused by the delay.', 'In case of an emergency, the client must immediately notify Sais Creations LLC (Party Rentals & Decor Services). We will try our best to find a solution; however, emergencies do not automatically waive the client’s responsibility for late returns or any resulting costs.', 'Late return fees may apply for items kept beyond the agreed rental period.'] },
  { title: 'Security Deposit', items: ['A refundable security deposit may be required for selected rental items.', 'The deposit will be refunded after all items are returned in their original condition.'] },
  { title: 'Prohibited Uses', items: ['Rental items may not be sublet, loaned to third parties, or used for purposes other than the agreed event without our written consent.'] },
  { title: 'Pickup & Return', items: ['Customers are responsible for transporting rental items safely.', 'All items must be returned clean and in the same condition they were received.', 'Please notify us immediately if any item is damaged during your event.'] },
  { title: 'Damage, Loss & Theft', items: ['Customers are responsible for any lost, stolen, broken, or damaged items during the rental period.', 'Repair or replacement costs will be charged based on the current replacement value.'] },
  { title: 'Outdoor Use', items: ['Rental items should be protected from rain, high winds, mud, excessive heat, and other harsh weather conditions unless approved by us.', 'Damage caused by weather or improper use is the customer’s responsibility.'] },
  { title: 'Cancellations & Date Changes', items: ['Booking deposits are non-refundable.', 'Date changes are subject to availability.', 'If we are unavailable on the new date, the original cancellation policy applies.'] },
  { title: 'Liability', items: ['Customers assume responsibility for the safe use of all rental items.', 'Sais Creations LLC (Party Rentals & Decor Services) is not responsible for injuries or damages resulting from misuse of rental equipment.'] },
  { title: 'Damage & Loss Policy', items: ['The client is responsible for all rental items from the time of pickup to drop-off. Any lost, stolen, broken, damaged, or excessively dirty items will be charged to the client for repair, replacement, or cleaning costs.', 'Clients and guests must handle all decor items, furniture, props, and rental equipment with care. Any damage caused during the event due to misuse, accidents, or guest activities will be the client’s responsibility.', 'A security deposit may be required for certain rentals and will be returned after all items are inspected and found to be in the same condition as provided.'] },
  { title: 'Item Inspection & Acceptance Policy', items: ['Clients are encouraged to inspect all rental items at the time of pickup. By accepting the items, the client confirms that the items were received in satisfactory condition and as agreed.', 'Any concerns regarding missing items, damage, cleanliness, or condition of the items must be reported at the time of pickup before leaving with the rental items.', 'Complaints made after the items have been taken from our possession may not be accepted, as we cannot verify how the items were handled after pickup.'] },
  { title: 'Photo Documentation Policy', items: ['Sais Creations LLC (Party Rentals & Decor Services) may take photos or videos of rental items before pickup and after return to document the condition of the items.', 'These photos or videos may be used to verify the condition of the items, including any existing damage, missing pieces, stains, or damage that occurs during the rental period.', 'Clients are encouraged to review the items at pickup and notify us immediately of any concerns before taking possession of the rental items.'] },
  { title: 'Rental Pickup Schedule & Appointment Policy', items: ['Clients must arrive for rental item pickup at the agreed date and time. Pickup times are scheduled in advance to ensure smooth service for all customers.', 'If the client arrives late or fails to arrive during the confirmed pickup time, Sais Creations LLC (Party Rentals & Decor Services) cannot guarantee availability after that time due to personal emergencies, schedule changes, or other commitments.', 'Any delay caused by the client’s late arrival may result in rescheduling of pickup or cancellation of the rental if we are unable to accommodate the delayed pickup.', 'Clients are responsible for informing us as early as possible if they are unable to arrive at the scheduled pickup time.'] },
  { title: 'Requesting a Quote', items: ['Submitting a quote request through our website or WhatsApp does not constitute a binding contract. A contract is formed only when we confirm your order in writing via email, WhatsApp, or other written communication.'] },
]

const decorSections = [
  { title: 'Booking', items: ['A non-refundable booking deposit is required to reserve your event date.', 'Your booking is confirmed only after the deposit is received.'] },
  { title: 'Final Payment', items: ['The remaining balance must be paid before the event setup unless otherwise agreed.'] },
  { title: 'Design & Customization', items: ['We will work closely with you to create a design based on your preferences and budget.'] },
  { title: 'Venue Access', items: ['Clients are responsible for securing venue access, permits (if required), and setup permissions.', 'Delays caused by restricted venue access may result in additional charges.'] },
  { title: 'Setup & Breakdown', items: ['Setup and teardown times will be scheduled in advance.', 'Clients must ensure the venue is available during the agreed setup and pickup times.'] },
  { title: 'Cancellations & Rescheduling', items: ['Booking deposits are non-refundable.', 'Rescheduling is subject to availability.', 'Additional fees may apply if significant changes are requested after planning has begun.'] },
  { title: 'Client-Owned Items', items: ['We are not responsible for damage to customer-provided decor or personal belongings.'] },
  { title: 'Photography', items: ['We may photograph our completed decor for our website, social media, and portfolio unless the client requests otherwise before the event.'] },
  { title: 'Liability', items: ['Once the decor has been accepted at the venue, Sais Creations Party Rentals & Decor Services is not responsible for damages caused by guests, venue staff, weather, or circumstances beyond our control.'] },
  { title: 'Force Majeure', items: ['Sais Creations Party Rentals & Decor Services is not responsible for delays or cancellations caused by events beyond our control, such as bad weather, natural disasters, government restrictions, emergencies, venue closures, major road closures, accidents, or unexpected travel disruptions.', 'We will do our best to inform the client and find a suitable solution whenever possible.'] },
  { title: 'Electrical Requirements', items: ['Clients must ensure adequate and safe power outlets for lighting, LED decor, and equipment.'] },
  { title: 'Quote Validity', items: ['Quotations are valid for 30 days from the date issued and are subject to change afterward.'] },
  { title: 'Venue Cleanliness', items: ['Sais Creations Decor Services is responsible only for the decoration setup and removal of our items. Any mess, spills, trash, food stains, or damage caused by the client, guests, vendors, or venue activities after the decoration is completed will not be our responsibility to clean.', 'All our items must be kept in good and clean condition after the event when ready for pickup. Clients are responsible for ensuring that our decor items are not damaged, stained, or mishandled during the event.'] },
  { title: 'Late Pickup & Venue Access Policy', items: ['The client is responsible for providing proper access to the venue at the agreed setup and pickup times. Delays caused by venue restrictions, locked access, event activities, or lack of assistance may affect setup or pickup schedules.', 'If our team is unable to access the venue for pickup at the scheduled time, additional pickup fees may apply.'] },
  { title: 'Decor Design Reference & Final Outcome Policy', items: ['Clients may provide inspiration pictures or design references for their event decor; however, an exact replica cannot be guaranteed.', 'The final design may vary due to differences in available materials, inventory, venue space, lighting, colors, flower availability, and creative adjustments made by our design team.', 'By approving the decor concept, colors, and design details before the event, the client acknowledges and understands that the final setup will be a creative interpretation of the provided reference.', 'Once the decoration is completed, dissatisfaction based only on minor differences from the inspiration image will not be considered a reason for a refund or price adjustment. We encourage clients to discuss any concerns or changes before the event setup begins so we can make reasonable adjustments whenever possible.'] },
]

function PolicySection({ title, items }) {
  return (
    <motion.div variants={fadeUp} className="mb-8">
      <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-3">{title}</h3>
      <ul className="font-body text-[14px] text-[#2B2118]/65 leading-[1.85] list-disc pl-5 space-y-1.5">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </motion.div>
  )
}

export default function TermsAndConditions() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
          <motion.div variants={fadeUp} className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#B07D3F] hover:text-[#7B2D43] transition-colors duration-300 mb-8"><ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Home</Link>
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center"><span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/30 bg-[#B07D3F]/[0.06]" /><ScrollText className="w-5 h-5 text-[#B07D3F]" strokeWidth={1.5} /></div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118]">Terms &amp; Conditions</h1>
          </motion.div>
          <motion.p variants={fadeUp} className="font-body text-[14px] text-[#2B2118]/50 mb-14">Last Updated: July 15, 2026</motion.p>

          <motion.section variants={fadeUp} className="mb-16">
            <h2 className="font-display text-3xl font-semibold text-[#7B2D43] mb-5">Rental Terms &amp; Conditions</h2>
            <p className="font-body text-[15px] text-[#2B2118]/70 leading-relaxed mb-9">Thank you for choosing Sais Creations LLC (Party Rentals &amp; Decor Services). Please review the following rental policies before booking.</p>
            {rentalSections.map((section) => <PolicySection key={section.title} {...section} />)}
            <p className="font-body text-[14px] text-[#2B2118]/70 leading-relaxed mt-8">By placing a rental order, you agree to these Rental and Decor Service Terms &amp; Policies.</p>
          </motion.section>

          <motion.div variants={fadeUp} className="h-px bg-gradient-to-r from-transparent via-[#B07D3F]/35 to-transparent mb-16" />

          <motion.section variants={fadeUp} className="mb-14">
            <h2 className="font-display text-3xl font-semibold text-[#7B2D43] mb-5">Decor Services Terms &amp; Conditions</h2>
            <p className="font-body text-[15px] text-[#2B2118]/70 leading-relaxed mb-9">We, Sais Creations LLC (Decor Services &amp; Party Rentals), are committed to creating beautiful event decor while providing a smooth planning experience.</p>
            {decorSections.map((section) => <PolicySection key={section.title} {...section} />)}
            <p className="font-body text-[14px] text-[#2B2118]/70 leading-relaxed mt-8">By booking our decor services, you acknowledge that you have read and agree to these Sais Creations LLC Decor Services Terms &amp; Policies.</p>
          </motion.section>

          <motion.section variants={fadeUp} className="border-t border-[#B07D3F]/20 pt-10">
            <h2 className="font-display text-xl font-semibold text-[#2B2118] mb-4">Changes to These Terms</h2>
            <p className="font-body text-[14px] text-[#2B2118]/65 leading-[1.85] mb-8">We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page with an updated “Last Updated” date. Your continued use of the site or services after any changes constitutes acceptance of the revised terms.</p>
            <h2 className="font-display text-xl font-semibold text-[#2B2118] mb-4">Contact Us</h2>
            <p className="font-body text-[14px] text-[#2B2118]/65 leading-[1.85] whitespace-pre-line">{`Business Name: Sais Creations LLC (Decor Services & Party Rentals)\nEmail: saicreations729@gmail.com\nPhone: +1 (408) 387-4854`}</p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}
