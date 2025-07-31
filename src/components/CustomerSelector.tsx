import React from "react";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import { THEME_COLORS } from "../types";

interface CustomerSelectorProps {
  showPeriod?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  showPeriod = false,
}) => {
  const {
    selectedCustomerId,
    setSelectedCustomerId,
    selectedPeriod,
    setSelectedPeriod,
    customers,
    periods,
  } = useCustomer();

  const { user } = useAuth();
  const isMaster = user?.role === "master";

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomerId(e.target.value);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
  };

  // 現在選択されている顧客名を取得
  const selectedCustomerName =
    customers.find((c) => c.id === selectedCustomerId)?.name || "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          顧客名:
        </span>
        {isMaster ? (
          <select
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 max-w-[240px] sm:max-w-[180px] lg:max-w-[200px]"
            style={{ borderColor: THEME_COLORS.border }}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        ) : (
          <span
            className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 min-w-0 max-w-[240px] sm:max-w-[180px] lg:max-w-[200px]"
            style={{ borderColor: THEME_COLORS.border }}
          >
            {selectedCustomerName}
          </span>
        )}
      </div>

      {showPeriod && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            実施日:
          </span>
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 max-w-[240px] sm:max-w-[180px] lg:max-w-[200px]"
            style={{ borderColor: THEME_COLORS.border }}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
