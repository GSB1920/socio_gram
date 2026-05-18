import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import { MessageCircle, Maximize2, X, ChevronLeft, Edit, Send } from 'lucide-react';

export default function Layout({ children, onCreateClick }) {
  const router = useRouter();
  const isMessagesPage = router.pathname === '/messages';
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMiniChat, setActiveMiniChat] = useState(null);

  // Mock contacts for the mini chat
  const contacts = [
    { id: "thelallantop", name: "thelallantop", active: "Active 1h ago", img: "https://ui-avatars.com/api/?name=thelallantop&background=random" },
    { id: "rvcjinsta", name: "rvcjinsta", active: "Active now", img: "https://ui-avatars.com/api/?name=rvcjinsta&background=random" },
    { id: "filtercopy", name: "filtercopy", active: "Active 5m ago", img: "https://ui-avatars.com/api/?name=filtercopy&background=random" },
  ];

  const handleExpandPage = (contactId) => {
      if (contactId) {
          router.push(`/messages?user=${contactId}`);
      } else {
          router.push('/messages');
      }
      setIsExpanded(false);
      setActiveMiniChat(null);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <MobileHeader />
      <MobileNav onCreateClick={onCreateClick} />
      <Sidebar onCreateClick={onCreateClick} />
      
      <main className={`flex-1 ml-0 lg:ml-[72px] flex justify-start bg-white dark:bg-black transition-all duration-300 ease-in-out ${isMessagesPage ? 'overflow-hidden' : ''}`}>
        <div className={`flex w-full ${isMessagesPage ? 'max-w-full' : 'max-w-full lg:max-w-[1000px]'} justify-center`}>
            <div className={`w-full ${isMessagesPage ? 'max-w-full p-0' : 'max-w-full lg:max-w-[630px] pt-mobile-header pb-nav-safe lg:pt-8 lg:pb-0 px-2 lg:px-4'} flex-shrink-0`}>
            {children}
            </div>

            {/* Right Sidebar Container - Hide on Messages page */}
            {!isMessagesPage && (
                <div className="hidden lg:block w-[380px] flex-shrink-0">
                    <RightSidebar />
                </div>
            )}
        </div>
      </main>

      {/* Floating Messages Widget - Hide on Messages page */}
      {!isMessagesPage && (
        <>
            {/* Collapsed Pill */}
            {!isExpanded && (
                <div 
                    onClick={() => setIsExpanded(true)}
                    className="hidden lg:flex fixed bottom-4 right-4 z-50 bg-white dark:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-full px-4 py-3 items-center space-x-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                    <div className="flex items-center -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" alt="" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="font-semibold text-sm">Messages</span>
                    <div className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        8
                    </div>
                </div>
            )}

            {/* Expanded Mini Window */}
            {isExpanded && (
                <div className="hidden lg:flex fixed bottom-4 right-4 z-50 bg-white dark:bg-zinc-900 shadow-2xl rounded-t-xl rounded-b-none border border-zinc-200 dark:border-zinc-700 w-[330px] h-[400px] flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        {activeMiniChat ? (
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setActiveMiniChat(null)} className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-full">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="font-bold text-sm">{activeMiniChat.name}</span>
                            </div>
                        ) : (
                            <span className="font-bold text-base">Messages</span>
                        )}
                        
                        <div className="flex items-center space-x-1">
                            {/* Expand Button */}
                            <button 
                                onClick={() => handleExpandPage(activeMiniChat?.id)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                                title="Open in Messages"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            {/* New Message (only on list view) */}
                            {!activeMiniChat && (
                                <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            {/* Close Button */}
                            <button 
                                onClick={() => { setIsExpanded(false); setActiveMiniChat(null); }}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
                        {activeMiniChat ? (
                            // Mini Chat View
                            <div className="flex flex-col h-full">
                                <div className="flex-1 p-4 space-y-3">
                                     <div className="flex justify-start">
                                         <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[80%]">
                                             Hey! Is this working?
                                         </div>
                                     </div>
                                     <div className="flex justify-end">
                                         <div className="bg-[#3797f0] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[80%]">
                                             Yes, fully functional! 🚀
                                         </div>
                                     </div>
                                </div>
                                {/* Mini Input */}
                                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-2">
                                        <input type="text" placeholder="Message..." className="flex-1 bg-transparent text-sm focus:outline-none" />
                                        <button className="text-[#0095f6] font-semibold text-xs">Send</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Contact List View
                            <div className="py-2">
                                {contacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        onClick={() => setActiveMiniChat(contact)}
                                        className="flex items-center space-x-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                                    >
                                        <div className="relative">
                                            <img src={contact.img} className="w-10 h-10 rounded-full object-cover" alt="" />
                                            {contact.active === "Active now" && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="font-semibold text-sm truncate">{contact.name}</div>
                                            <div className="text-xs text-zinc-500 truncate">Sent an attachment • 1h</div>
                                        </div>
                                        <div className="w-2 h-2 bg-[#0095f6] rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
}

