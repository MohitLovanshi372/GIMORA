/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CityEconomyMetrics } from '../city/types';

export class CityEconomyManager {
  private baseJobs = 3450000;
  private businessesCount = 28400;
  public metrics: CityEconomyMetrics;

  constructor() {
    this.metrics = {
      totalJobs: this.baseJobs,
      employmentRate: 96.4,
      activeBusinesses: this.businessesCount,
      hourlyRevenueCredits: 184500,
      commercialTaxRate: 8.5,
      transitFareIncome: 42800,
      economicHealth: 'BOOMING',
    };
  }

  public update(delta: number, activeVehicles: number, activeTrains: number) {
    // Fluctuate revenue slightly based on active transportation and commerce
    const transitBonus = activeVehicles * 120 + activeTrains * 2400;
    this.metrics.transitFareIncome = Math.round(38000 + transitBonus);
    this.metrics.hourlyRevenueCredits = Math.round(140000 + this.metrics.transitFareIncome + Math.sin(Date.now() * 0.001) * 4500);

    // Dynamic employment rate
    this.metrics.employmentRate = Number((96.2 + Math.sin(Date.now() * 0.0005) * 0.4).toFixed(1));
  }

  public getSnapshot(): CityEconomyMetrics {
    return { ...this.metrics };
  }
}
