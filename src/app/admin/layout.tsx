import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Nav from '@/components/Nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');
  if (session.role === 'teacher') redirect('/teacher');
  if (session.role === 'parent') redirect('/parent');
  if (session.role !== 'admin') redirect('/');

  return (
    <div className="flex min-h-screen">
      <Nav role="admin" />
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 pt-14 md:pt-8 page-enter" style={{ background: '#0b130c' }}>
        {children}
      </main>
    </div>
  );
}
