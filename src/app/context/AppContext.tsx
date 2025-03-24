'use client'
import { createContext, useContext, useState, ReactNode, SetStateAction, Dispatch } from 'react';
import { Page, RequestToShowButtonType } from '../types/app-types';


interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  showWalletModal: boolean;
  setShowWalletModal: Dispatch<SetStateAction<boolean>>;
  requestToShow: RequestToShowButtonType;
  setRequestToShow: (button: RequestToShowButtonType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('create-store');
  const [requestToShow, setRequestToShow] = useState<RequestToShowButtonType>('recent');
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage, showWalletModal, setShowWalletModal, requestToShow, setRequestToShow }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
}