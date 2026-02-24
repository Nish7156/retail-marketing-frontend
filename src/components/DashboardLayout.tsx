import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar, SidebarTrigger } from "@/components/AppSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar isMobile={false} />
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-56 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <AppSidebar
            isOpen={true}
            onClose={() => setMobileMenuOpen(false)}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col min-w-0">
        <motion.header
          className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SidebarTrigger onClick={() => setMobileMenuOpen(true)} />
          <div className="flex-1" />
        </motion.header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-auto max-w-4xl"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
