import { useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";
import RightSidebar from "./RightSidebar";
import SearchDrawer from "./SearchDrawer";
import { useCreateModals } from "./CreateModals";

export default function Layout({ children }) {
  const router = useRouter();
  const isMessagesPage = router.pathname === "/messages";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { handleCreateClick, modals } = useCreateModals();

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen((v) => !v);

  return (
    <div className="flex min-h-dvh min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Sidebar
        onCreateClick={handleCreateClick}
        isSearchOpen={isSearchOpen}
        onSearchToggle={toggleSearch}
        onSearchClose={closeSearch}
      />

      <SearchDrawer isOpen={isSearchOpen} onClose={closeSearch} />
      <MobileHeader />

      <main
        className={`ml-0 flex min-h-0 flex-1 flex-col justify-center bg-white transition-all duration-300 ease-in-out dark:bg-black lg:ml-[72px] lg:pt-0 ${
          isMessagesPage ? "overflow-hidden" : "pb-nav-safe lg:pb-0"
        } pt-mobile-shell lg:!pt-0`}
      >
        <div
          className={`flex w-full flex-1 ${
            isMessagesPage ? "max-w-full min-h-0" : "max-w-[1000px]"
          } justify-center`}
        >
          <div
            className={`w-full flex-shrink-0 ${
              isMessagesPage
                ? "max-w-full min-h-0 p-0"
                : "max-w-[630px] px-3 pt-4 sm:px-4 sm:pt-8 lg:px-4"
            }`}
          >
            {children}
          </div>

          {!isMessagesPage && (
            <div className="hidden w-[380px] flex-shrink-0 lg:block">
              <RightSidebar />
            </div>
          )}
        </div>
      </main>

      {!isSearchOpen && (
        <MobileNav
          onCreateClick={handleCreateClick}
          onSearchOpen={openSearch}
        />
      )}

      {modals}
    </div>
  );
}
