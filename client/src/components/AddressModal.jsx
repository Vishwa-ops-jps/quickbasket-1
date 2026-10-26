import React, { useState } from 'react';
import { X, MapPin, Plus, Check, Home, Briefcase, Navigation } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function AddressModal() {
  const { addresses, currentAddress, setCurrentAddress, addAddress, isLocationModalOpen, setIsLocationModalOpen } = useLocation();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    tag: 'Home',
    recipient: 'Vishwa V',
    phone: '+91 98450 12345',
    flat: '',
    area: '',
    city: 'Bengaluru',
    pincode: ''
  });

  if (!isLocationModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.flat || !formData.area || !formData.pincode) return;
    addAddress(formData);
    setIsAdding(false);
    setFormData({
      tag: 'Home',
      recipient: 'Vishwa V',
      phone: '+91 98450 12345',
      flat: '',
      area: '',
      city: 'Bengaluru',
      pincode: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#0c831f]" />
            <h3 className="text-base font-extrabold text-gray-900">
              Select Delivery Location
            </h3>
          </div>
          <button
            onClick={() => {
              setIsLocationModalOpen(false);
              setIsAdding(false);
            }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!isAdding ? (
            <div className="space-y-3">
              {/* Existing Addresses */}
              {addresses.map((addr) => {
                const isSelected = currentAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      setCurrentAddress(addr);
                      setIsLocationModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-[#0c831f] bg-green-50/60 ring-2 ring-green-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        isSelected ? 'bg-[#0c831f] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {addr.tag === 'Home' ? (
                          <Home className="w-4 h-4" />
                        ) : (
                          <Briefcase className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-gray-900">
                            {addr.tag}
                          </span>
                          <span className="text-[10px] font-extrabold text-[#0c831f] bg-green-100 px-1.5 py-0.5 rounded">
                            {addr.eta || '10 MINS'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-1">
                          {addr.flat}, {addr.area}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {addr.city} - {addr.pincode}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#0c831f] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#0c831f] hover:text-[#0c831f] text-gray-600 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Delivery Address</span>
              </button>
            </div>
          ) : (
            /* Add Address Form */
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                {['Home', 'Office', 'Other'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setFormData({ ...formData, tag: t })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      formData.tag === t
                        ? 'bg-[#0c831f] text-white border-[#0c831f]'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  House / Flat / Floor No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 301, Silver Tower"
                  value={formData.flat}
                  onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0c831f]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Street / Area / Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0c831f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0c831f]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 560038"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0c831f]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0c831f] hover:bg-[#086317] text-white text-xs font-black uppercase tracking-wider"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

