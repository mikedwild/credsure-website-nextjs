import { roiCalculatorData, calculateROI } from './roiCalculator';

describe('roiCalculatorData', () => {
  test('has required headline and subheadline', () => {
    expect(roiCalculatorData.headline).toBe('Calculate Your Efficiency Gains');
    expect(roiCalculatorData.subheadline).toContain('time and money');
  });

  test('has credential volume options', () => {
    expect(roiCalculatorData.credentialVolumes).toHaveLength(6);
    expect(roiCalculatorData.credentialVolumes[0]).toEqual({ value: 100, label: '100 credentials/month' });
  });

  test('has manual time options', () => {
    expect(roiCalculatorData.manualTimeOptions.length).toBeGreaterThan(0);
    expect(roiCalculatorData.manualTimeOptions[0]).toHaveProperty('value');
    expect(roiCalculatorData.manualTimeOptions[0]).toHaveProperty('label');
  });

  test('has hourly cost options', () => {
    expect(roiCalculatorData.hourlyCostOptions.length).toBeGreaterThan(0);
  });

  test('has automated time per credential', () => {
    expect(roiCalculatorData.automatedTimePerCredential).toBe(0.5);
  });

  test('has CredSure pricing tiers', () => {
    expect(roiCalculatorData.credsurePricing).toHaveProperty('100');
    expect(roiCalculatorData.credsurePricing).toHaveProperty('1000');
    expect(roiCalculatorData.credsurePricing[100]).toBe(45);
  });
});

describe('calculateROI', () => {
  test('calculates efficiency gains at 1000 volume, 10 min, €50/hr', () => {
    const result = calculateROI(1000, 10, 50);
    
    // Manual: 1000 * 10 / 60 = 166.67 hours, * 50 = 8333
    expect(result.manualHoursMonth).toBeCloseTo(166.7, 0);
    expect(result.manualCostMonth).toBe(8333);
    
    // Automated: 1000 * 0.5 / 60 = 8.33 hours, * 50 = 417 + 99 sub = 516
    expect(result.automatedHoursMonth).toBeCloseTo(8.3, 0);
    expect(result.credsureSubscription).toBe(99);
    
    // Savings
    expect(result.costSavedMonth).toBeGreaterThan(7000);
    expect(result.roiPercent).toBeGreaterThan(90);
  });

  test('calculates time saved in work days per year', () => {
    const result = calculateROI(1000, 10, 50);
    
    // timeSavedHoursMonth ~= 158.3 hrs, * 12 / 8 = ~237 days
    expect(result.timeSavedDaysYear).toBeGreaterThan(200);
  });

  test('calculates cost per credential', () => {
    const result = calculateROI(1000, 10, 50);
    
    expect(result.manualCostPerCredential).toBeGreaterThan(0);
    expect(result.automatedCostPerCredential).toBeGreaterThan(0);
    expect(result.automatedCostPerCredential).toBeLessThan(result.manualCostPerCredential);
  });

  test('handles low volume correctly', () => {
    const result = calculateROI(100, 5, 25);
    
    expect(result.manualHoursMonth).toBeCloseTo(8.3, 0);
    expect(result.credsureSubscription).toBe(45);
    expect(result.costSavedMonth).toBeGreaterThan(0);
  });

  test('ROI percent is never negative', () => {
    const result = calculateROI(100, 5, 25);
    expect(result.roiPercent).toBeGreaterThanOrEqual(0);
  });
});
