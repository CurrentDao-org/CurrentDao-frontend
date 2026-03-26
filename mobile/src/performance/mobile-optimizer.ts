import { BatteryManager } from './battery-manager';
import { MemoryManager } from './memory-manager';
import { NetworkOptimizer } from './network-optimizer';
import { BackgroundProcessor } from './background-processor';
import { MobileMonitor } from './monitoring/mobile-monitor';

export class MobileOptimizer {
  private batteryManager: BatteryManager;
  private memoryManager: MemoryManager;
  private networkOptimizer: NetworkOptimizer;
  private backgroundProcessor: BackgroundProcessor;
  private monitor: MobileMonitor;

  constructor() {
    this.batteryManager = new BatteryManager();
    this.memoryManager = new MemoryManager();
    this.networkOptimizer = new NetworkOptimizer();
    this.backgroundProcessor = new BackgroundProcessor();
    this.monitor = new MobileMonitor(this.batteryManager, this.memoryManager, this.networkOptimizer);
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.batteryManager.initialize(),
      this.memoryManager.initialize(),
      this.networkOptimizer.initialize(),
      this.backgroundProcessor.initialize(),
      this.monitor.initialize(),
    ]);
  }

  async optimize(): Promise<void> {
    // Run all optimizations
    await Promise.all([
      this.batteryManager.optimize(),
      this.memoryManager.optimize(),
      this.networkOptimizer.optimize(),
      this.backgroundProcessor.optimize(),
    ]);

    // Start monitoring
    this.monitor.startMonitoring();
  }

  getMetrics() {
    return this.monitor.getMetrics();
  }

  async cleanup(): Promise<void> {
    await Promise.all([
      this.batteryManager.cleanup(),
      this.memoryManager.cleanup(),
      this.networkOptimizer.cleanup(),
      this.backgroundProcessor.cleanup(),
      this.monitor.cleanup(),
    ]);
  }
}