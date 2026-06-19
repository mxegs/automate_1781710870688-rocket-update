import { redirect } from 'next/navigation';

export default function VisitorLoginRedirect() {
  redirect('/login?mode=visitor');
}
