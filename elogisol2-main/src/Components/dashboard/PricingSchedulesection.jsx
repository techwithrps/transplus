import React, { useEffect } from "react";
import ServicesSelection from "../dashboard/ServiceSelection";

const PricingScheduleSection = ({
  safeRequestData,
  setRequestData,
  services,
  loadingServices,
  handleServiceToggle,
  handleServicePriceChange,
  isNewServiceModalOpen,
  setIsNewServiceModalOpen,
  handleServiceAdded,
  today,
  currentTime,
}) => {
  const currentNoOfVehicles = parseInt(safeRequestData.no_of_vehicles) || 1;

  // Initialize dates on component mount if they're empty
  useEffect(() => {
    const needsUpdate = {};

    if (!safeRequestData.expected_pickup_date) {
      needsUpdate.expected_pickup_date = today;
    }

    if (!safeRequestData.expected_delivery_date) {
      needsUpdate.expected_delivery_date = today;
    }

    if (Object.keys(needsUpdate).length > 0) {
      setRequestData((prev) => ({
        ...prev,
        ...needsUpdate,
      }));
    }
  }, [
    today,
    safeRequestData.expected_pickup_date,
    safeRequestData.expected_delivery_date,
    setRequestData,
  ]);

  // Calculate total charge directly from service prices
  const calculateTotalCharge = () => {
    const servicePrices = safeRequestData.service_prices || {};
    const totalServiceCharge = Object.values(servicePrices).reduce(
      (sum, price) => sum + (parseFloat(price) || 0),
      0
    );
    return totalServiceCharge;
  };

  const totalCharge = calculateTotalCharge();

  return (
    <>
      {/* Services Required with Price Inputs */}
      <div className="space-y-4">
        <ServicesSelection
          services={services}
          loadingServices={loadingServices}
          selectedServices={safeRequestData.service_type}
          servicePrices={safeRequestData.service_prices}
          onServiceToggle={handleServiceToggle}
          onServicePriceChange={handleServicePriceChange}
          isNewServiceModalOpen={isNewServiceModalOpen}
          setIsNewServiceModalOpen={setIsNewServiceModalOpen}
          onServiceAdded={handleServiceAdded}
        />
      </div>

      {/* Total Charge Display */}
      {safeRequestData.service_type.length > 0 && (
        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200/80">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs text-gray-900">Pricing Summary</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(safeRequestData.service_prices).map(
                ([service, price]) => (
                  <div key={service} className="flex justify-between text-gray-600">
                    <span>{service}:</span>
                    <span className="font-medium text-gray-900">₹{parseFloat(price) || 0}</span>
                  </div>
                )
              )}
              <div className="border-t border-blue-200/80 pt-1.5 mt-1.5">
                <div className="flex justify-between font-bold text-sm text-blue-900">
                  <span>Total Charge:</span>
                  <span>₹{totalCharge.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dates and Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Expected Pickup Date
          </label>
          <input
            type="date"
            name="expected_pickup_date"
            className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={safeRequestData.expected_pickup_date || today}
            onChange={(e) =>
              setRequestData((prev) => ({
                ...prev,
                expected_pickup_date: e.target.value,
              }))
            }
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Expected Delivery Date
          </label>
          <input
            type="date"
            className="w-full h-8.5 border border-gray-300 rounded-md px-2.5 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={safeRequestData.expected_delivery_date || today}
            onChange={(e) =>
              setRequestData({
                ...safeRequestData,
                expected_delivery_date: e.target.value,
              })
            }
            required
          />
        </div>
      </div>
    </>
  );
};

export default PricingScheduleSection;
