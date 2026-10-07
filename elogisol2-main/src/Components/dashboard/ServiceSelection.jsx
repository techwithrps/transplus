import React from "react";
import NewServiceModal from "./NewServiceModal";

const ServicesSelection = ({
  services,
  setServices,
  loadingServices,
  selectedServices,
  servicePrices,
  onServiceToggle,
  onServicePriceChange,
  isNewServiceModalOpen,
  setIsNewServiceModalOpen,
  onServiceAdded,
}) => {
  const handleServiceClick = (service) => {
    const isSelected = selectedServices.includes(service.SERVICE_NAME);
    onServiceToggle(service.SERVICE_NAME, isSelected);
  };

  const handlePriceChange = (serviceName, price) => {
    onServicePriceChange(serviceName, price);
  };

  // Handle new service addition
  const handleAddService = async (newServiceName) => {
    // Simulate API call to add service to the database
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ SERVICE_NAME: newServiceName }),
      });

      if (!response.ok) {
        throw new Error("Failed to add service to database");
      }

      const newService = await response.json(); // Assume API returns the new service
      // Update services list with the new service
      setServices((prevServices) => [
        ...prevServices,
        {
          SERVICE_ID: newService.SERVICE_ID || Date.now(), // Use a temporary ID if API doesn't provide one
          SERVICE_NAME: newServiceName,
        },
      ]);

      // Call the parent handler if provided
      if (onServiceAdded) {
        onServiceAdded(newServiceName);
      }
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Failed to add service. Please try again.");
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-semibold text-gray-700">
          Services Required with Selling Price
        </label>
      </div>

      {loadingServices ? (
        <div className="flex justify-center py-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {services.map((service) => (
            <div
              key={service.SERVICE_ID}
              className={`border rounded-lg p-2.5 transition-all ${
                selectedServices.includes(service.SERVICE_NAME)
                  ? "bg-blue-50/70 border-blue-500 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => handleServiceClick(service)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedServices.includes(service.SERVICE_NAME)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="ml-2 text-xs font-semibold text-gray-900">
                      {service.SERVICE_NAME}
                    </span>
                  </div>
                </div>
              </div>

              {selectedServices.includes(service.SERVICE_NAME) && (
                <div className="mt-2 pt-2 border-t border-blue-200/60">
                  <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
                    Selling Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full h-8 pl-6 pr-2.5 border border-gray-300 rounded-md text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={servicePrices[service.SERVICE_NAME] || ""}
                      onChange={(e) =>
                        handlePriceChange(service.SERVICE_NAME, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesSelection;
