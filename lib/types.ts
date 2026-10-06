// Flow states
export type FlowState = 'upload' | 'generating' | 'failure' | 'success';

// Failure codes
export type FailureCode = 'LOW_LIGHT' | 'FULL_BODY_NOT_VISIBLE' | 'IMAGE_QUALITY';

// Failure reason
export interface FailureReason {
  code: FailureCode;
  title: string;
  description: string;
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

// Recovery action
export type RecoveryAction = 'retry' | 'different_outfit' | 'similar_style' | 'not_my_style';

// Taste feedback
export type TasteFeedback = 'more_like_this' | 'less_like_this' | 'save';
