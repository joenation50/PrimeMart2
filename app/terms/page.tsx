// app/terms/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service · PrimeMart',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using PrimeMart, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

        <h2>2. Marketplace Nature</h2>
        <p>PrimeMart is a discovery and contact platform. All negotiations, payments, delivery, and disputes happen directly between the Buyer and Seller on WhatsApp. PrimeMart does not hold funds, mediate disputes, or guarantee delivery.</p>

        <h2>3. Seller Subscriptions</h2>
        <p>Sellers must pay a ₦5,000/year (or $10/year for international sellers) subscription fee to publish listings. <strong>All payments are final and non-refundable.</strong> We do not offer refunds for unused time, failed listings, lack of buyer contact, or account termination for policy violations.</p>

        <h2>4. Seller Responsibilities</h2>
        <p>Sellers agree to provide accurate descriptions, use real photos of the items they own, and respond to buyer inquiries in a timely manner. Sellers found to be scamming, selling counterfeit goods, or violating our policies will be banned without refund.</p>

        <h2>5. Buyer Safety</h2>
        <p>Buyers are advised to never pay before seeing the item. Always meet in public places for physical transactions.</p>

        <h2>6. Account Suspension</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms, without prior notice or refund.</p>
      </div>
    </div>
  );
}