import { redirect } from 'next/navigation';

export default function AuthAppHome() {
  // Redirect to login page as default for auth app
  redirect('/login');
}