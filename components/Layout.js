import { useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import RightSidebar from "./RightSidebar";
import SearchDrawer from "./SearchDrawer";

export default function Layout({ children, onCreateClick }) {
  const router = useRouter();
  const isMessagesPage = router.pathname === "/messages";
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen((v) => !v);

  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Sidebar
        onCreateClick={onCreateClick}
        isSearchOpen={isSearchOpen}
        onSearchToggle={toggleSearch}
        onSearchClose={closeSearch}
      />

      <SearchDrawer isOpen={isSearchOpen} onClose={closeSearch} />

      <main
        className={`ml-0 flex flex-1 justify-center bg-white transition-all duration-300 ease-in-out dark:bg-black lg:ml-[72px] ${
          isMessagesPage ? "overflow-hidden" : "pb-16 lg:pb-0"
        }`}
      >
        <div
          className={`flex w-full ${
            isMessagesPage ? "max-w-full" : "max-w-[1000px]"
          } justify-center`}
        >
          <div
            className={`w-full flex-shrink-0 ${
              isMessagesPage
                ? "max-w-full p-0"
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

      <MobileNav onCreateClick={onCreateClick} onSearchOpen={openSearch} />
    </div>
  );
}
