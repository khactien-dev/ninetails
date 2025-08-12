import { trashBagType } from '@/constants/charts';

import { chartColors } from './chart';

// LegendManager.ts
class LegendManager {
  private static instance: LegendManager;
  routes: string[];
  sections: string[];
  RouteColors: Record<string, string>;
  L4TypeColors: Record<string, string>;
  sectionColors: Record<string, string>;
  excludeKeys: Array<string | number>;

  private constructor() {
    this.routes = [];
    this.sections = [];
    this.RouteColors = {};
    this.L4TypeColors = {};
    this.sectionColors = {};
    this.excludeKeys = [];
  }

  // Singleton pattern - Trả về instance duy nhất
  public static getInstance(): LegendManager {
    if (!LegendManager.instance) {
      LegendManager.instance = new LegendManager();
    }
    return LegendManager.instance;
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  initializeL4TypeColors(): Record<string, string> {
    return trashBagType.reduce((acc, item, index) => {
      acc[item] = chartColors[index];
      return acc;
    }, {} as Record<string, string>);
  }

  initializeSectionColors(sections: string[]) {
    this.sectionColors = sections.reduce((acc, item, index) => {
      acc[item] = chartColors[index];
      return acc;
    }, {} as Record<string, string>);
  }

  generateRouteColors(items: string[]) {
    this.routes = items;
    this.L4TypeColors = this.initializeL4TypeColors();
    this.RouteColors = items.reduce((acc, item) => {
      acc[item] = this.getRandomColor();
      return acc;
    }, {} as Record<string, string>);
  }

  updateExcludeKeys(newKeys: Array<string | number>) {
    this.excludeKeys = newKeys;
  }

  updateSections(keys: Array<string>) {
    this.sections = keys;
  }

  getRoutes() {
    return this.routes;
  }

  // Phương thức lấy toàn bộ RouteColors
  getAllRouteColors() {
    return this.RouteColors;
  }

  getL4TypeColors() {
    return this.L4TypeColors;
  }

  getSectionColors() {
    return this.sectionColors;
  }
  getRouteColor(item: string) {
    return this.RouteColors[item] || '#000000';
  }

  getL4TypeColor(item: string) {
    return this.L4TypeColors[item] || '#000000';
  }

  getExcludeKeys() {
    return this.excludeKeys;
  }

  getSections() {
    return this.sections;
  }
}

export default LegendManager.getInstance(); // Xuất ra instance duy nhất
