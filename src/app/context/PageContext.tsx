'use client'
import { createContext, useContext, useState, ReactNode, SetStateAction, Dispatch } from 'react';

type Page = 'create-store' | 'all-equipment' | 'upload-equipment';

interface PageContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  showWalletModal: boolean;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('create-store');
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage, showWalletModal, setShowWalletModal }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
}