declare module "qrcode.react" {
  import { ComponentType } from "react";

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: "L" | "M" | "Q" | "H";
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
   
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate: boolean;
    };
  }
  export const QRCodeCanvas: ComponentType<QRCodeProps>;
  export const QRCodeSVG: ComponentType<QRCodeProps>;

}