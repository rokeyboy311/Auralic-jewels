import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8 text-xs text-[#4a4237]">
      <div className="text-center space-y-2 border-b border-[#ebdccd] pb-6">
        <span className="text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-medium">
          Legal Framework
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] uppercase font-light">
          Terms & Conditions of Sale
        </h1>
        <p className="text-[#73685a]">Maison Auralic Fine Jewellery International</p>
      </div>

      <div className="space-y-6 leading-relaxed bg-[#faf8f5] border border-[#c5b49e]/40 p-6 sm:p-10">
        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            1. Scope of Terms
          </h2>
          <p>
            These General Terms and Conditions govern all orders, acquisitions, design modifications, and bespoke commissions placed through the Maison Auralic website or via our Private Atelier Concierge.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            2. Product Authenticity & Gemological Dossiers
          </h2>
          <p>
            All fine jewellery pieces sold by Maison Auralic are guaranteed 100% genuine and hallmarked in accordance with French and international assay standards. Solitaire diamonds are accompanied by official GIA or IGI certificates.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            3. Currency & Pricing Integrity
          </h2>
          <p>
            Prices are displayed in your chosen currency and re-calculated dynamically at prevailing real-time exchange rates. Maison Auralic reserves the right to correct manifest typographical or pricing errors before order processing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-[#141210] uppercase font-medium">
            4. Applicable Law & Jurisdiction
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of France. Any disputes arising shall be subject to the exclusive jurisdiction of the Courts of Paris.
          </p>
        </section>
      </div>
    </div>
  );
}
