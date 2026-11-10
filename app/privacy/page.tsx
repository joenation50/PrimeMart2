// app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy · PrimeMart',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect your name, email address, country, and (if you are a seller) your WhatsApp number and business information.</p>

        <h2>2. How We Use It</h2>
        <p>Your email is used to log you in. Your WhatsApp number is shown to logged-in buyers so they can contact you. We do not sell your data to third parties.</p>

        <h2>3. Payments</h2>
        <p>When you upload proof of payment, we store the screenshot securely. This is used only for manual verification by our admin team.</p>

        <h2>4. Cookies</h2>
        <p>We use essential cookies to keep you logged in. We do not use third-party tracking cookies.</p>

        <h2>5. Data Deletion</h2>
        <p>You can request deletion of your account from your Account Settings page. Once deleted, your data is retained for 90 days in our backups before being permanently erased.</p>
      </div>
    </div>
  );
}