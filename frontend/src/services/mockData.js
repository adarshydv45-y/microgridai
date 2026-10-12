// Deterministic Demonstration Mock Data for Standalone Static Deployments (e.g., Vercel)

export function generateMockHistory(range = '24h') {
  const count = range === '30d' ? 720 : range === '7d' ? 168 : 24;
  const data = [];
  const now = new Date(2026, 9, 12, 18, 0, 0);

  let soc = 55.0;
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const h = t.getHours();
    const dow = t.getDay();
    const isWknd = dow === 0 || dow === 6;

    // Solar diurnal curve (0 at night, peak around 12:00)
    let solar = 0;
    if (h >= 6 && h <= 18) {
      solar = Math.max(0, Math.sin((Math.PI * (h - 6)) / 12) * 22.5 + (Math.sin(i) * 1.5));
    }
    solar = Math.round(solar * 10) / 10;

    // Demand load profile
    const morning = 6.0 * Math.exp(-Math.pow(h - 8.5, 2) / 6.5);
    const evening = 9.5 * Math.exp(-Math.pow(h - 19.5, 2) / 9.5);
    const base = 5.5 + (isWknd ? 0.6 : 1.0);
    let demand = Math.round((base + morning + evening + (Math.cos(i) * 0.8)) * 10) / 10;
    demand = Math.max(3.2, demand);

    const net = Math.round((solar - demand) * 10) / 10;
    let bPower = 0;
    let gIn = 0;
    let gOut = 0;

    if (net > 0) {
      bPower = Math.min(net, 12.0, (95.0 - soc) * 0.6);
      bPower = Math.round(bPower * 10) / 10;
      soc = Math.min(95.0, soc + (bPower * 0.95 / 60.0) * 100);
      gOut = Math.round(Math.max(0, net - bPower) * 10) / 10;
    } else {
      const def = Math.abs(net);
      bPower = -Math.min(def, 12.0, (soc - 15.0) * 0.6);
      bPower = Math.round(bPower * 10) / 10;
      soc = Math.max(15.0, soc - (Math.abs(bPower) / 0.95 / 60.0) * 100);
      gIn = Math.round(Math.max(0, def - Math.abs(bPower)) * 10) / 10;
    }

    const tsStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')} ${String(h).padStart(2, '0')}:00:00`;

    data.push({
      timestamp: tsStr,
      solar_kw: solar,
      demand_kw: demand,
      battery_soc: Math.round(soc * 10) / 10,
      battery_power_kw: bPower,
      grid_import_kw: gIn,
      grid_export_kw: gOut,
      ambient_temp_c: Math.round((24.0 + 7.0 * Math.sin((2 * Math.PI * (h - 9)) / 24)) * 10) / 10,
      irradiance_wm2: solar > 0 ? Math.round(solar * 42.0) : 0,
      net_power_kw: net
    });
  }

  const totalSolar = Math.round(data.reduce((acc, d) => acc + d.solar_kw, 0) * 10) / 10;
  const totalDemand = Math.round(data.reduce((acc, d) => acc + d.demand_kw, 0) * 10) / 10;
  const totalGridIn = Math.round(data.reduce((acc, d) => acc + d.grid_import_kw, 0) * 10) / 10;
  const totalGridOut = Math.round(data.reduce((acc, d) => acc + d.grid_export_kw, 0) * 10) / 10;
  const renPct = totalDemand > 0 ? Math.round(((totalDemand - totalGridIn) / totalDemand) * 1000) / 10 : 100.0;

  // Daily summaries
  const dailyMap = {};
  data.forEach((d) => {
    const day = d.timestamp.split(' ')[0];
    if (!dailyMap[day]) {
      dailyMap[day] = { s: 0, dem: 0, b: 0, gi: 0, go: 0 };
    }
    dailyMap[day].s += d.solar_kw;
    dailyMap[day].dem += d.demand_kw;
    dailyMap[day].b += Math.abs(d.battery_power_kw) / 2.0;
    dailyMap[day].gi += d.grid_import_kw;
    dailyMap[day].go += d.grid_export_kw;
  });

  const dailySummaries = Object.keys(dailyMap).map((day) => {
    const row = dailyMap[day];
    const sKwh = Math.round(row.s * 10) / 10;
    const demKwh = Math.round(row.dem * 10) / 10;
    const giKwh = Math.round(row.gi * 10) / 10;
    return {
      date: day,
      solar_generated_kwh: sKwh,
      demand_consumed_kwh: demKwh,
      battery_throughput_kwh: Math.round(row.b * 10) / 10,
      grid_imported_kwh: giKwh,
      grid_exported_kwh: Math.round(row.go * 10) / 10,
      renewable_fraction_pct: demKwh > 0 ? Math.round(((demKwh - giKwh) / demKwh) * 1000) / 10 : 100.0,
    };
  });

  return {
    time_range: range,
    interval: '1 Hour (60 min)',
    total_solar_kwh: totalSolar,
    total_demand_kwh: totalDemand,
    total_grid_import_kwh: totalGridIn,
    total_grid_export_kwh: totalGridOut,
    renewable_fraction_pct: renPct,
    data,
    daily_summaries: dailySummaries,
    data_source: 'Deterministic Demonstration Dataset (Microgrid Simulator)'
  };
}

export function generateMockForecast() {
  const hours = [];
  let sTotal = 0;
  let dTotal = 0;
  let simSoc = 62.0;
  let pSolarPeak = 0;
  let pSolarHour = 12;
  let pDemPeak = 0;
  let pDemHour = 19;

  for (let h = 0; h < 24; h++) {
    let pSolar = 0;
    if (h >= 6 && h <= 18) {
      pSolar = Math.round(Math.max(0, Math.sin((Math.PI * (h - 6)) / 12) * 21.8) * 10) / 10;
    }
    const pDemand = Math.round((6.5 + 5.5 * Math.exp(-Math.pow(h - 8.5, 2) / 6.5) + 9.0 * Math.exp(-Math.pow(h - 19.5, 2) / 9.5)) * 10) / 10;
    const net = Math.round((pSolar - pDemand) * 10) / 10;

    if (pSolar > pSolarPeak) { pSolarPeak = pSolar; pSolarHour = h; }
    if (pDemand > pDemPeak) { pDemPeak = pDemand; pDemHour = h; }

    if (net > 0) {
      simSoc = Math.min(95.0, simSoc + (net * 0.95 / 60.0) * 100);
    } else {
      simSoc = Math.max(15.0, simSoc - (Math.abs(net) / 0.95 / 60.0) * 100);
    }

    sTotal += pSolar;
    dTotal += pDemand;

    hours.push({
      timestamp: `2026-10-13 ${String(h).padStart(2, '0')}:00:00`,
      hour: h,
      predicted_solar_kw: pSolar,
      predicted_demand_kw: pDemand,
      net_predicted_balance_kw: net,
      expected_battery_soc: Math.round(simSoc * 10) / 10,
      baseline_solar_kw: Math.round(Math.max(0, pSolar + (Math.sin(h) * 1.2)) * 10) / 10,
      baseline_demand_kw: Math.round(Math.max(3.0, pDemand + (Math.cos(h) * 0.9)) * 10) / 10,
      is_peak_generation: h === 12,
      is_peak_demand: h === 19
    });
  }

  const sKwh = Math.round(sTotal * 10) / 10;
  const dKwh = Math.round(dTotal * 10) / 10;

  return {
    generated_at: '2026-10-12T18:00:00',
    forecast_horizon_hours: 24,
    solar_model_name: 'GradientBoostingRegressor (v1.0)',
    demand_model_name: 'GradientBoostingRegressor (v1.0)',
    summary: {
      total_predicted_solar_kwh: sKwh,
      total_predicted_demand_kwh: dKwh,
      net_predicted_balance_kwh: Math.round((sKwh - dKwh) * 10) / 10,
      peak_solar_hour: pSolarHour,
      peak_solar_kw: pSolarPeak,
      peak_demand_hour: pDemHour,
      peak_demand_kw: pDemPeak,
      expected_curtailment_kwh: 12.4,
      expected_grid_deficit_kwh: 28.5
    },
    hourly_forecast: hours,
    model_performance: {
      solar_forecast: {
        model_type: 'GradientBoostingRegressor',
        mae_kw: 0.075,
        rmse_kw: 0.131,
        r2_score: 1.0,
        baseline_mae_kw: 1.217,
        baseline_rmse_kw: 2.414,
        mae_reduction_pct: 93.8
      },
      demand_forecast: {
        model_type: 'GradientBoostingRegressor',
        mae_kw: 0.525,
        rmse_kw: 0.638,
        r2_score: 0.958,
        baseline_mae_kw: 0.869,
        baseline_rmse_kw: 1.13,
        mae_reduction_pct: 39.6
      }
    },
    explanation: `Next 24h outlook: Solar generation estimated at ${sKwh} kWh with peak of ${pSolarPeak} kW around ${pSolarHour}:00. Total load demand estimated at ${dKwh} kWh peaking at ${pDemPeak} kW at ${pDemHour}:00. Net energy balance: ${(sKwh - dKwh).toFixed(1)} kWh.`,
    data_source: 'Trained Regression ML Pipeline (Deterministic Split)'
  };
}

export function generateMockDashboard() {
  const f = generateMockForecast();
  return {
    system_info: {
      service_name: 'MicrogridAI',
      version: '1.0.0',
      status: 'OPERATIONAL',
      data_source: 'Deterministic Demonstration Dataset (Microgrid Simulator, Seed 42)',
      is_live_telemetry: false,
      last_refresh_timestamp: '2026-10-12 18:00:00',
      ml_models: {
        solar_forecast_model: 'GradientBoostingRegressor (Active)',
        demand_forecast_model: 'GradientBoostingRegressor (Active)',
        anomaly_detector: 'IsolationForest (Active)'
      },
      cloud_environment: 'Vercel Cloud Edge',
      host: '0.0.0.0',
      port: 8080
    },
    current_metrics: {
      solar_kw: 18.4,
      demand_kw: 11.2,
      battery_soc: 68.5,
      renewable_utilization_pct: 88.5,
      grid_import_kw: 0.0,
      grid_export_kw: 3.2,
      battery_power_kw: 4.0,
      net_balance_kw: 7.2,
      timestamp: '2026-10-12 18:00:00',
      status_summary: 'Self-Sufficient (Solar & Battery)'
    },
    forecast_preview: f.summary,
    top_recommendations: [
      {
        id: 'REC-001',
        action_type: 'CHARGE_BATTERY',
        title: 'Maximize Battery Charging from Solar Surplus',
        priority: 'HIGH',
        impact_estimate: 'Absorb +7.2 kW solar surplus locally, saving ~$1.08/h grid cost.',
        reasoning: 'Current solar generation (18.4 kW) exceeds facility demand (11.2 kW) by +7.2 kW with 18.9 kWh battery capacity remaining.',
        mathematical_basis: 'P_net = +7.20 kW > 0; SoC = 68.5% < 95%; Headroom = (95% - 68.5%) * 60 kWh = 18.90 kWh.',
        created_at: '2026-10-12 18:00:00',
        parameters: { target_charge_kw: 7.2, headroom_kwh: 18.9, battery_soc: 68.5 }
      },
      {
        id: 'REC-002',
        action_type: 'GRID_EXPORT',
        title: 'Export Surplus Solar Generation or Divert to Thermal Dump Load',
        priority: 'MEDIUM',
        impact_estimate: 'Export up to 3.2 kW to utility grid for net-metering feed-in tariff.',
        reasoning: 'Battery charging throttled to safe C-rate limits. Surplus power available for export.',
        mathematical_basis: 'P_net = +7.2 kW; Battery Charge Rate = 4.0 kW; Residual = 3.2 kW.',
        created_at: '2026-10-12 18:00:00',
        parameters: { export_kw: 3.2 }
      }
    ],
    recent_alerts: [
      {
        id: 'alt-ok',
        type: 'INFO',
        message: 'All microgrid circuits operating within nominal safety thresholds.',
        timestamp: '2026-10-12 18:00:00'
      }
    ]
  };
}

export function generateMockAnomalies() {
  return {
    total_anomalies: 5,
    active_anomalies_count: 3,
    records: [
      {
        id: 'anom-1',
        timestamp: '2026-10-11 12:00:00',
        solar_kw: 0.0,
        demand_kw: 14.2,
        battery_soc: 45.0,
        anomaly_score: 0.892,
        severity: 'CRITICAL',
        fault_type: 'SOLAR_INVERTER_TRIP',
        signal_explanation: 'Zero solar generation recorded despite solar irradiance exceeding 750 W/m².',
        is_synthetic_demo: true
      },
      {
        id: 'anom-2',
        timestamp: '2026-10-10 19:00:00',
        solar_kw: 0.0,
        demand_kw: 48.5,
        battery_soc: 22.0,
        anomaly_score: 0.885,
        severity: 'HIGH',
        fault_type: 'EXCESSIVE_LOAD_SPIKE',
        signal_explanation: 'Load spiked to 48.5 kW, exceeding 3 standard deviations above normal peak load.',
        is_synthetic_demo: true
      },
      {
        id: 'anom-3',
        timestamp: '2026-10-09 15:00:00',
        solar_kw: 8.0,
        demand_kw: 18.0,
        battery_soc: 9.2,
        anomaly_score: 0.941,
        severity: 'CRITICAL',
        fault_type: 'BATTERY_THERMAL_DISCHARGE',
        signal_explanation: 'Discharge rate exceeded rated limits with battery cell temperature at 52.8°C.',
        is_synthetic_demo: true
      },
      {
        id: 'anom-4',
        timestamp: '2026-10-08 04:00:00',
        solar_kw: 0.0,
        demand_kw: 14.333,
        battery_soc: 50.0,
        anomaly_score: 0.655,
        severity: 'MEDIUM',
        fault_type: 'SENSOR_STUCK',
        signal_explanation: 'Identical static sensor value reported continuously across 6 observation cycles.',
        is_synthetic_demo: true
      },
      {
        id: 'anom-5',
        timestamp: '2026-10-07 02:00:00',
        solar_kw: 0.0,
        demand_kw: 8.0,
        battery_soc: 55.0,
        anomaly_score: 0.780,
        severity: 'HIGH',
        fault_type: 'UNCOORDINATED_INJECTION',
        signal_explanation: 'High power export detected at 02:00 with no active PV generation schedule.',
        is_synthetic_demo: true
      }
    ],
    metrics: {
      model_name: 'Isolation Forest (scikit-learn)',
      contamination_rate: 0.04,
      n_test_samples: 336,
      precision: 0.950,
      recall: 0.920,
      f1_score: 0.935,
      true_positives: 12,
      false_positives: 1,
      true_negatives: 320,
      false_negatives: 1
    },
    data_label: 'Synthetic Demonstration Benchmark Dataset (Ground Truth Labelled)'
  };
}

export function generateMockRecommendations() {
  return {
    timestamp: '2026-10-12 18:00:00',
    system_status: 'OPTIMAL',
    current_net_power_kw: 7.2,
    battery_headroom_kwh: 18.9,
    recommendations: [
      {
        id: 'REC-001',
        action_type: 'CHARGE_BATTERY',
        title: 'Maximize Battery Charging from Solar Surplus',
        priority: 'HIGH',
        impact_estimate: 'Absorb +7.2 kW solar surplus locally, saving ~$1.08/h grid cost.',
        reasoning: 'Current solar generation (18.4 kW) exceeds facility demand (11.2 kW) by +7.2 kW with 18.9 kWh battery capacity remaining.',
        mathematical_basis: 'P_net = +7.20 kW > 0; SoC = 68.5% < 95%; Headroom = (95% - 68.5%) * 60 kWh = 18.90 kWh.',
        created_at: '2026-10-12 18:00:00',
        parameters: { target_charge_kw: 7.2, headroom_kwh: 18.9, battery_soc: 68.5 }
      },
      {
        id: 'REC-002',
        action_type: 'GRID_EXPORT',
        title: 'Export Surplus Solar Generation or Divert to Dump Load',
        priority: 'MEDIUM',
        impact_estimate: 'Export up to 3.2 kW to utility grid or activate secondary thermal heat storage.',
        reasoning: 'Battery charging set to safe thermal rate; remaining solar surplus can be exported for feed-in revenue.',
        mathematical_basis: 'P_net = +7.20 kW; Charge Rate = 4.0 kW; Available Export = 3.2 kW.',
        created_at: '2026-10-12 18:00:00',
        parameters: { export_kw: 3.2, battery_soc: 68.5 }
      },
      {
        id: 'REC-003',
        action_type: 'SCHEDULE_LOAD',
        title: 'Schedule Discretionary Heavy Loads for Midday Solar Peak',
        priority: 'LOW',
        impact_estimate: 'Increase direct self-consumption by 18-25% without battery cycling.',
        reasoning: 'Tomorrow midday solar generation will exceed 20 kW between 11:00 and 14:00.',
        mathematical_basis: 'Peak Solar = 21.8 kW at 12:00; Total 24h Net Generation = +34.2 kWh.',
        created_at: '2026-10-12 18:00:00',
        parameters: { peak_hour: 12, net_24h_kwh: 34.2 }
      }
    ],
    calculation_basis: 'Configured Limits: Battery Capacity 60.0 kWh, Safe SoC [15.0% - 95.0%], Max Charge 12.0 kW.'
  };
}

export function simulateAnomalyInference(payload) {
  const { solar_kw, demand_kw, battery_soc, battery_power_kw, ambient_temp_c } = payload;
  let score = 0.15;
  let isAnomaly = false;
  let status = 'NORMAL';
  let severity = 'NONE';
  let signal = 'Nominal Operating Boundaries';
  let explanation = 'All telemetry signals are within safe operational limits.';
  let recAction = 'No intervention needed. Operating normally.';

  if (demand_kw > 35.0) {
    score = 0.885;
    isAnomaly = true;
    status = 'ANOMALOUS';
    severity = 'HIGH';
    signal = 'Demand Load (demand_kw)';
    explanation = `Critical load spike detected at ${demand_kw} kW, exceeding 3 standard deviations above normal.`;
    recAction = 'Inspect downstream circuits and shed non-essential commercial loads.';
  } else if (ambient_temp_c > 48.0 || (battery_power_kw < -15.0 && ambient_temp_c > 40.0)) {
    score = 0.941;
    isAnomaly = true;
    status = 'ANOMALOUS';
    severity = 'CRITICAL';
    signal = 'Battery Thermal / Discharge Overrun';
    explanation = `Dangerous combination: Discharge power ${battery_power_kw} kW at ${ambient_temp_c}°C cell temperature.`;
    recAction = 'Throttle battery discharge immediately to avoid thermal runaway. Check cooling fans.';
  } else if (battery_soc < 15.0) {
    score = 0.780;
    isAnomaly = true;
    status = 'ANOMALOUS';
    severity = 'HIGH';
    signal = 'Battery SoC Deep-Discharge Breached';
    explanation = `Battery State of Charge (${battery_soc}%) has breached the 15% safe cutoff reserve.`;
    recAction = 'Inhibit further battery discharge. Draw essential power from utility grid.';
  } else if (solar_kw === 0.0 && ambient_temp_c > 25.0 && payload.irradiance_wm2 > 600) {
    score = 0.892;
    isAnomaly = true;
    status = 'ANOMALOUS';
    severity = 'CRITICAL';
    signal = 'Solar Inverter Trip (solar_kw)';
    explanation = 'Zero solar PV generation reported despite high solar irradiance (>600 W/m²).';
    recAction = 'Reset solar inverter circuit breaker and inspect DC isolation switches.';
  }

  return {
    is_anomaly: isAnomaly,
    anomaly_score: score,
    raw_decision_score: isAnomaly ? -0.15 : 0.08,
    status,
    severity,
    primary_deviant_signal: signal,
    explanation,
    recommended_action: recAction,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
}
