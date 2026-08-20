import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8 text-xs text-[#4a4237]">
      <div className="text-center space-y-2 border-b border-[#ebdccd] pb-6">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Maison Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
          Confidentiality & Privacy Policy
        </h1>
        <p className="text-[#73685a]">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-6 leading-relaxed bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-10">
        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            1. Patron Data Confidentiality
          </h2>
          <p>
            Maison Auralic Paris (&quot;Auralic&quot;, &quot;we&quot;, &quot;our&quot;) is committed to safeguarding the confidentiality and privacy of our global patrons. We collect only information required to fulfill fine jewellery acquisitions, coordinate insured delivery logistics, and provide bespoke concierge consultations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            2. Payment Information Security
          </h2>
          <p>
            Payment transactions are processed through PCI-DSS Level 1 certified gateways (Stripe). Maison Auralic never stores raw credit card numbers or banking passwords on our local servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            3. Armored Courier Disclosures
          </h2>
          <p>
            Recipient name, delivery address, and contact telephone number are transmitted strictly under encrypted non-disclosure agreements to certified armored carriers (Ferrari Group, FedEx Valuables) solely to execute secure delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            4. GDPR & CCPA Patron Rights
          </h2>
          <p>
            Patrons may at any time request a full export of their personal data or request permanent deletion from our client registry by contacting privacy@auralic-jewels.vercel.app.
          </p>
        </section>
      </div>
    </div>
  );
}
