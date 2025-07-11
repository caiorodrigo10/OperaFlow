'use client';

import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

const INITIAL_WIDTH = '70rem';
const MAX_WIDTH = '800px';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 200,
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    transition: { duration: 0.1 },
  },
};

export function Navbar() {
  const { scrollY } = useScroll();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setHasScrolled(latest > 10);
    });
    return unsubscribe;
  }, [scrollY]);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const handleOverlayClick = () => setIsDrawerOpen(false);

  return (
    <header
      className={cn(
        'sticky z-50 mx-4 flex justify-center transition-all duration-300 md:mx-0',
        hasScrolled ? 'top-6' : 'top-4 mx-0',
      )}
    >
      <motion.div
        initial={{ width: INITIAL_WIDTH }}
        animate={{ width: hasScrolled ? MAX_WIDTH : INITIAL_WIDTH }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          className={cn(
            'mx-auto max-w-7xl rounded-2xl transition-all duration-300 xl:px-0',
            hasScrolled
              ? 'px-2 border border-zinc-800 backdrop-blur-lg bg-black/75'
              : 'shadow-none px-7',
          )}
        >
          <div className="flex h-[56px] items-center justify-between p-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">
                Operabase
              </div>
            </Link>

            {/* Right side - simplified */}
            <div className="flex flex-row items-center gap-3 shrink-0">
              <div className="flex items-center space-x-3">
                {user ? (
                  <Link
                    className="bg-orange-600 hover:bg-orange-700 h-8 hidden md:flex items-center justify-center text-sm font-medium tracking-wide rounded-full text-white w-fit px-4 transition-all duration-200"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    className="bg-orange-600 hover:bg-orange-700 h-8 hidden md:flex items-center justify-center text-sm font-medium tracking-wide rounded-full text-white w-fit px-4 transition-all duration-200"
                    href="/auth"
                  >
                    Sign In
                  </Link>
                )}
              </div>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden border border-zinc-700 size-8 rounded-md cursor-pointer flex items-center justify-center text-white hover:bg-zinc-800 transition-colors"
                onClick={toggleDrawer}
              >
                {isDrawerOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Drawer - simplified */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              onClick={handleOverlayClick}
            />

            <motion.div
              className="fixed inset-x-0 w-[95%] mx-auto bottom-3 bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-lg"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="text-xl font-bold text-white">
                      Operabase
                    </div>
                  </Link>
                  <button
                    onClick={toggleDrawer}
                    className="border border-zinc-700 rounded-md p-1 cursor-pointer text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="bg-orange-600 hover:bg-orange-700 h-10 flex items-center justify-center text-sm font-medium tracking-wide rounded-lg text-white w-full px-4 transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      className="bg-orange-600 hover:bg-orange-700 h-10 flex items-center justify-center text-sm font-medium tracking-wide rounded-lg text-white w-full px-4 transition-all duration-200"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  ); 
}
