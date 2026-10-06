// Flow states
export type FlowState = 'upload' | 'generating' | 'failure' | 'success';

// Failure categories & codes
export type FailureCategory = 'input' | 'content' | 'system';
export type FailureCode = 
  | 'LOW_LIGHT' 
  | 'FULL_BODY_NOT_VISIBLE' 
  | 'MULTIPLE_PEOPLE' 
  | 'OUTFIT_FIT_FAILURE' 
  | 'NETWORK_ERROR' 
  | 'TIMEOUT';

// Recovery actions
export type RecoveryAction = 
  | 'retry' 
  | 'upload_brighter' 
  | 'upload_full_body' 
  | 'upload_solo' 
  | 'different_outfit' 
  | 'similar_style' 
  | 'not_my_style';

// Structured Failure Reason
export interface FailureReason {
  code: FailureCode;
  category: FailureCategory;
  title: string;
  description: string;
  primaryAction: RecoveryAction;
  allowedActions: RecoveryAction[];
  requiresUpload: boolean;
  isSimulatedDemoFailure?: boolean;
}

// Outfit
export interface Outfit {
  id: string;
  name: string;
  style: string;
  color: string; // CSS color for the demo visualization
  secondaryColor: string;
}

// Generation result
export interface GenerationResult {
  success: boolean;
  resultId?: string;
  outfit?: Outfit;
  failure?: FailureReason;
}

// Client-side image analysis signal
export interface ImageAnalysisResult {
  brightness: {
    score: number; // 0..255
    status: 'pass' | 'warning';
    message?: string;
  };
  aspectRatio: {
    ratio: number;
    isLandscape: boolean;
    status: 'pass' | 'warning';
    message?: string;
  };
}

// Demo Controls
export interface DemoControls {
  forceMode: 'auto' | 'success' | 'LOW_LIGHT' | 'FULL_BODY_NOT_VISIBLE' | 'MULTIPLE_PEOPLE' | 'OUTFIT_FIT_FAILURE' | 'NETWORK_ERROR' | 'TIMEOUT';
  latencyMs: number;
}

// Taste state
export interface TasteState {
  styles: Record<string, number>;
  preferences: Record<string, boolean>;
  rejectedStyles: string[];
}

// Analytics event
export interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

// Taste feedback
export type TasteFeedback = 'more_like_this' | 'less_like_this' | 'save';

