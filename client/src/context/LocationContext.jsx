import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      tag: 'Home',
      recipient: 'Vishwa V',
      phone: '+91 98450 12345',
      flat: 'Flat 402, Green Glen Palms',
      area: 'Bellandur, Outer Ring Road',
      city: 'Bengaluru',
      pincode: '560103',
      eta: '8-10 MINS'
    },
    {
      id: 'addr-2',
      tag: 'Office',
      recipient: 'Vishwa V',
      phone: '+91 98450 12345',
      flat: 'Tower B, 7th Floor, RMZ Ecospace',
      area: 'Sarjapur Road',
      city: 'Bengaluru',
      pincode: '560103',
      eta: '11-13 MINS'
    }
  ]);

  const [currentAddress, setCurrentAddress] = useState(addresses[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Fetch from backend if available
  useEffect(() => {
    fetch('/api/addresses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAddresses(data);
          setCurrentAddress(data[0]);
        }
      })
      .catch(err => console.log('Using default addresses'));
  }, []);

  const addAddress = (newAddr) => {
    const formatted = {
      ...newAddr,
      id: 'addr-' + Date.now(),
      eta: '9-12 MINS'
    };
    setAddresses(prev => [...prev, formatted]);
    setCurrentAddress(formatted);

    // Save to backend
    fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    }).catch(err => console.log('Saved locally'));
  };

  return (
    <LocationContext.Provider
      value={{
        addresses,
        currentAddress,
        setCurrentAddress,
        addAddress,
        isLocationModalOpen,
        setIsLocationModalOpen
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

