import { useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import MobileNav from "./MobileNav";
import RightSidebar from "./RightSidebar";
import SearchDrawer from "./SearchDrawer";
import CreateModals from "./CreateModals";

export default function Layout({ children }) {
  const router = useRouter();
  const isMessagesPage = router.pathname === "/messages";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCreateModal, setActiveCreateModal] = useState(null);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen((v) => !v);

  const handleCreateClick = (type) => {
    setActiveCreateModal(type);
  };

  const closeCreateModal = () => setActiveCreateModal(null);

  return (
    <div className="flex min-h-dvh bg-white text-black dark:bg-black dark:text-white">
      <Sidebar
        onCreateClick={handleCreateClick}
        isSearchOpen={isSearchOpen}
        onSearchToggle={toggleSearch}
        onSearchClose={closeSearch}
      />

      <MobileHeader />

      <SearchDrawer isOpen={isSearchOpen} onClose={closeSearch} />

      <CreateModals activeModal={activeCreateModal} onClose={closeCreateModal} />

      <main
        className={`ml-0 flex min-h-0 flex-1 flex-col justify-start bg-white transition-all duration-300 ease-in-out dark:bg-black md:ml-[72px] ${
          isMessagesPage ? "overflow-hidden" : "pb-nav-safe md:pb-0"
        } pt-mobile-header md:pt-0`}
      >
        <div
          className={`flex min-h-0 w-full flex-1 ${
            isMessagesPage ? "max-w-full" : "max-w-full md:max-w-[768px] lg:max-w-[1000px]"
          } justify-center`}
        >
          <div
            className={`w-full flex-shrink-0 ${
              isMessagesPage
                ? "max-w-full p-0"
                : "max-w-full px-2 pb-2 pt-2 md:mx-auto md:max-w-[500px] md:px-4 lg:max-w-[630px] lg:px-4 lg:pb-0 lg:pt-8"
            } ${isMessagesPage ? "flex min-h-0 flex-1 flex-col" : ""}`}
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

      <MobileNav
        onCreateClick={handleCreateClick}
        onSearchOpen={openSearch}
        hidden={isSearchOpen}
      />
    </div>
  );
}
