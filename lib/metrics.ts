import { AnalyticsEvent } from './types';

export interface LiveFunnelMetrics {
  totalEvents: number;
  uploadsStarted: number;
  uploadsValidated: number;
  generationStarts: number;
  firstAttemptFailures: number;
  secondAttemptStarts: number;
  successfulGenerations: number;
  recoveryActionsCount: number;
  tasteFeedbackCount: number;
  secondAttemptRate: string;
  recoveryRate: string;
}

export function calculateSessionFunnel(events: AnalyticsEvent[]): LiveFunnelMetrics {
  let uploadsStarted = 0;
  let uploadsValidated = 0;
  let generationStarts = 0;
  let firstAttemptFailures = 0;
  let secondAttemptStarts = 0;
  let successfulGenerations = 0;
  let recoveryActionsCount = 0;
  let tasteFeedbackCount = 0;

  events.forEach((ev) => {
    switch (ev.event) {
      case 'upload_started':
        uploadsStarted++;
        break;
      case 'upload_validated':
        uploadsValidated++;
        break;
      case 'generation_started':
        generationStarts++;
        if (typeof ev.properties?.attempt === 'number' && ev.properties.attempt >= 2) {
          secondAttemptStarts++;
        }
        break;
      case 'generation_failed':
        if (ev.properties?.attempt === 1) {
          firstAttemptFailures++;
        }
        break;
      case 'try_on_success':
        successfulGenerations++;
        break;
      case 'recovery_upload_brighter_clicked':
      case 'recovery_upload_full_body_clicked':
      case 'recovery_upload_solo_clicked':
      case 'different_outfit_selected':
      case 'similar_style_selected':
      case 'style_rejected':
      case 'retry_clicked':
        recoveryActionsCount++;
        break;
      case 'feedback_given':
      case 'look_saved':
        tasteFeedbackCount++;
        break;
    }
  });

  const secondAttemptRate = firstAttemptFailures > 0
    ? `${((secondAttemptStarts / firstAttemptFailures) * 100).toFixed(1)}%`
    : 'Not enough session data';

  const recoveryRate = firstAttemptFailures > 0
    ? `${((successfulGenerations / firstAttemptFailures) * 100).toFixed(1)}%`
    : 'Not enough session data';

  return {
    totalEvents: events.length,
    uploadsStarted,
    uploadsValidated,
    generationStarts,
    firstAttemptFailures,
    secondAttemptStarts,
    successfulGenerations,
    recoveryActionsCount,
    tasteFeedbackCount,
    secondAttemptRate,
    recoveryRate,
  };
}
