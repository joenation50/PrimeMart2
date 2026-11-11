// app/admin/login/page.tsx
import { LoginForm } from '@/features/admin/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Access · PrimeMart',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]" />
      
      <div className="glass-card relative w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <LoginForm />
      </div>
    </div>
  );
}