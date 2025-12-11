export enum AppState {
  INITIAL = 'INITIAL',
  STACKING = 'STACKING',
  READY_TO_LIGHT = 'READY_TO_LIGHT',
  CELEBRATING = 'CELEBRATING',
  FINISHED = 'FINISHED'
}

export interface CakeLayerProps {
  position: [number, number, number];
  color: string;
  radius: number;
  height: number;
  index: number;
  active: boolean; // Whether this layer should be visible/falling
  onLanded?: () => void;
}

export interface GeminiResponse {
  wish: string;
}
