/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnergyMetrics } from '../city/types';

export class SmartEnergyManager {
  public metrics: EnergyMetrics;
  private isBlackout = false;
  private blackoutDistrict: string | null = null;
  private blackoutTimer = 0;

  constructor() {
    this.metrics = {
      totalCapacityMW: 1250,
      currentConsumptionMW: 1042,
      surplusMW: 208,
      gridStatus: 'OPTIMAL',
      solarOutputMW: 320,
      geothermalOutputMW: 450,
      fusionOutputMW: 480,
      districtUsageMW: {
        downtown: 310,
        technology: 285,
        residential: 220,
        healthcare: 180,
        railway: 120,
        entertainment: 95,
        education: 68,
        riverside: 25,
        airport: 44,
      },
    };
  }

  public triggerDistrictBlackout(districtId = 'entertainment') {
    this.isBlackout = true;
    this.blackoutDistrict = districtId;
    this.blackoutTimer = 18; // 18 seconds duration
    this.metrics.gridStatus = 'BLACKOUT';
    this.metrics.currentConsumptionMW = Math.max(600, this.metrics.currentConsumptionMW - 120);
    this.metrics.surplusMW = this.metrics.totalCapacityMW - this.metrics.currentConsumptionMW;
  }

  public restoreGrid() {
    this.isBlackout = false;
    this.blackoutDistrict = null;
    this.blackoutTimer = 0;
    this.metrics.gridStatus = 'OPTIMAL';
    this.metrics.currentConsumptionMW = 1042;
    this.metrics.surplusMW = 208;
  }

  public update(delta: number) {
    if (this.isBlackout) {
      this.blackoutTimer -= delta;
      if (this.blackoutTimer <= 0) {
        this.restoreGrid();
      }
    } else {
      // Gentle fluctuating power load
      const jitter = Math.sin(Date.now() * 0.002) * 12;
      this.metrics.currentConsumptionMW = Math.round(1042 + jitter);
      this.metrics.surplusMW = this.metrics.totalCapacityMW - this.metrics.currentConsumptionMW;
      this.metrics.gridStatus = this.metrics.surplusMW > 50 ? 'OPTIMAL' : 'STRAINED';
    }
  }

  public getSnapshot(): EnergyMetrics {
    return { ...this.metrics };
  }
}
