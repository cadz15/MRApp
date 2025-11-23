export const routes = {
  medRep: `${process.env.EXPO_PUBLIC_API_LINK}/register-so-app`,
  customers: `${process.env.EXPO_PUBLIC_API_LINK}/customers`,
  customersCreate: `${process.env.EXPO_PUBLIC_API_LINK}/customer`,
  items: `${process.env.EXPO_PUBLIC_API_LINK}/items`,
  salesorder: `${process.env.EXPO_PUBLIC_API_LINK}/sales-orders`,
  salesCreate: `${process.env.EXPO_PUBLIC_API_LINK}/sales-order`,
  analytics: `${process.env.EXPO_PUBLIC_API_LINK}/dashboard-analytics`,
  dcrCreate: `${process.env.EXPO_PUBLIC_API_LINK}/dcr`,
  dcrData: `${process.env.EXPO_PUBLIC_API_LINK}/dcr-data`,
  customerAnalytics: `${process.env.EXPO_PUBLIC_API_LINK}/customer/anayltics/{id}`,
};
