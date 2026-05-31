"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import OnboardingModal from './OnboardingModal';

/**
 * NavbarWrapper: Conditionally renders the global Navbar.
 * Hides it on routes that have their own full-page layout (e.g., /login).
 */
export default function NavbarWrapper() {
  const pathname = usePathname();

  // Pages that manage their own layout / header
  const hideNavbarRoutes = ['/login'];
  const shouldHide = hideNavbarRoutes.some(route => pathname?.startsWith(route));

  if (shouldHide) return null;
  return (
    <>
      <Navbar />
      <OnboardingModal />
    </>
  );
}
