import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Nav from '@/components/Nav';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');
  if (session.role === 'admin') redirect('/admin');
  if (session.role === 'teacher') redirect('/teacher');

  return (
    <div className="flex min-h-screen">
      <Nav role={session.role} />
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 pt-14 md:pt-8" style={{ background: '#0b130c' }}>
        {children}
      </main>
    </div>
  );
}
