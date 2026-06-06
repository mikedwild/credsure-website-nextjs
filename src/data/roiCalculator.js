// ROI Calculator data and logic — focused on efficiency gains

export const roiCalculatorData = {
  headline: "Calculate Your Efficiency Gains",
  subheadline: "See how much time and money you save by automating credential management with CredSure",

  credentialVolumes: [
    { value: 100, label: "100 credentials/month" },
    { value: 500, label: "500 credentials/month" },
    { value: 1000, label: "1,000 credentials/month" },
    { value: 2500, label: "2,500 credentials/month" },
    { value: 5000, label: "5,000 credentials/month" },
    { value: 10000, label: "10,000+ credentials/month" }
  ],

  manualTimeOptions: [
    { value: 5, label: "5 min per credential" },
    { value: 10, label: "10 min per credential" },
    { value: 15, label: "15 min per credential" },
    { value: 20, label: "20 min per credential" },
    { value: 30, label: "30 min per credential" },
  ],

  hourlyCostOptions: [
    { value: 25, label: "€25/hr" },
    { value: 35, label: "€35/hr" },
    { value: 50, label: "€50/hr" },
    { value: 75, label: "€75/hr" },
    { value: 100, label: "€100/hr" },
  ],

  // CredSure automated time per credential (in minutes)
  automatedTimePerCredential: 0.5,

  // CredSure pricing tiers (monthly)
  credsurePricing: {
    100: 45,
    500: 99,
    1000: 99,
    2500: 199,
    5000: 199,
    10000: 499,
  },
};

export const calculateROI = (volume, manualMinutes, hourlyCost) => {
  const { automatedTimePerCredential, credsurePricing } = roiCalculatorData;

  // Manual process costs
  const manualHoursMonth = (volume * manualMinutes) / 60;
  const manualCostMonth = manualHoursMonth * hourlyCost;

  // Automated process costs (CredSure)
  const automatedHoursMonth = (volume * automatedTimePerCredential) / 60;
  const automatedLaborCostMonth = automatedHoursMonth * hourlyCost;
  const credsureSubscription = credsurePricing[volume] || 499;
  const automatedTotalMonth = automatedLaborCostMonth + credsureSubscription;

  // Savings
  const timeSavedHoursMonth = manualHoursMonth - automatedHoursMonth;
  const costSavedMonth = manualCostMonth - automatedTotalMonth;
  const costSavedYear = costSavedMonth * 12;
  const roiPercent = manualCostMonth > 0
    ? Math.round(((manualCostMonth - automatedTotalMonth) / manualCostMonth) * 100)
    : 0;

  // Cost per credential
  const manualCostPerCredential = volume > 0 ? manualCostMonth / volume : 0;
  const automatedCostPerCredential = volume > 0 ? automatedTotalMonth / volume : 0;

  return {
    manualHoursMonth: Math.round(manualHoursMonth * 10) / 10,
    manualCostMonth: Math.round(manualCostMonth),
    automatedHoursMonth: Math.round(automatedHoursMonth * 10) / 10,
    automatedTotalMonth: Math.round(automatedTotalMonth),
    credsureSubscription,
    timeSavedHoursMonth: Math.round(timeSavedHoursMonth * 10) / 10,
    timeSavedDaysYear: Math.round((timeSavedHoursMonth * 12) / 8),
    costSavedMonth: Math.round(costSavedMonth),
    costSavedYear: Math.round(costSavedYear),
    roiPercent: Math.max(0, roiPercent),
    manualCostPerCredential: Math.round(manualCostPerCredential * 100) / 100,
    automatedCostPerCredential: Math.round(automatedCostPerCredential * 100) / 100,
  };
};
