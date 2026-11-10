import { LoginForm } from '@/features/admin/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Access · PrimeMart',
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <LoginForm />
    </div>
  );
}