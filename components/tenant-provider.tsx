'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface TenantContextType {
  storeId: string | null;
  subdomain: string | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
  initialStoreId?: string;
  initialSubdomain?: string;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ 
  children, 
  initialStoreId, 
  initialSubdomain 
}) => {
  const [context, setContext] = useState<TenantContextType>({
    storeId: initialStoreId || null,
    subdomain: initialSubdomain || null,
    isLoading: typeof initialStoreId === 'undefined' || typeof initialSubdomain === 'undefined',
    error: null,
  });

  useEffect(() => {
    // If we don't have initial values, try to get them from the DOM or fetch them
    if (typeof initialStoreId === 'undefined' || typeof initialSubdomain === 'undefined') {
      const fetchTenantData = async () => {
        try {
          // Try to get from document head or meta tags
          const storeIdMeta = document.querySelector('meta[name="x-store-id"]');
          const subdomainMeta = document.querySelector('meta[name="x-store-subdomain"]');
          
          if (storeIdMeta && subdomainMeta) {
            setContext({
              storeId: storeIdMeta.getAttribute('content') || null,
              subdomain: subdomainMeta.getAttribute('content') || null,
              isLoading: false,
              error: null,
            });
          } else {
            // If not in meta tags, try to extract from URL or fetch from API
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            
            if (parts.length >= 3) {
              const subdomain = parts[0] || null;
              
              // Fetch store ID based on subdomain
              const response = await fetch(`/api/storefront/${subdomain}`);
              if (response.ok) {
                const data = await response.json();
                setContext({
                  storeId: data.id || null,
                  subdomain: subdomain,
                  isLoading: false,
                  error: null,
                });
              } else {
                setContext(prev => ({
                  ...prev,
                  isLoading: false,
                  error: 'Store not found',
                }));
              }
            } else {
              setContext(prev => ({
                ...prev,
                isLoading: false,
                error: 'Not a subdomain route',
              }));
            }
          }
        } catch (err) {
          setContext(prev => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          }));
        }
      };

      fetchTenantData();
    }
  }, [initialStoreId, initialSubdomain]);

  return (
    <TenantContext.Provider value={context}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// Hook to check if we're in a tenant context
export const useHasTenant = (): boolean => {
  const { storeId, subdomain } = useTenant();
  return !!storeId && !!subdomain;
};