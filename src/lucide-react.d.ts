// src/lucide-react.d.ts
// Arquivo de definição de tipos para lucide-react

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export type IconProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  };

  export type Icon = FC<IconProps>;

  export const DollarSign: Icon;
  export const ShoppingBag: Icon;
  export const Package: Icon;
  export const TrendingUp: Icon;
  export const AlertTriangle: Icon;
  export const Plus: Icon;
  export const Edit: Icon;
  export const Trash2: Icon;
  export const Eye: Icon;
  export const Palette: Icon;
  export const Save: Icon;
  export const X: Icon;
  export const Copy: Icon;
  export const Check: Icon;
  export const ShoppingCart: Icon;
  export const Store: Icon;
  export const LayoutDashboard: Icon;
  export const Warehouse: Icon;
  export const LogOut: Icon;
  export const Menu: Icon;
  export const Lock: Icon;
}