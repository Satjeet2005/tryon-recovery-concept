import { AnalyticsEvent } from './types';

export interface LiveFunnelMetrics {
  totalEvents: number;
  uniqueFlowsCount: number;
  uploadsStarted: number;
  uploadsValidated: number;
  generationStarts: number;
  firstAttemptFailures: number;
  secondAttemptStarts: number;
  recoveredWithin2: number;
  eventuallyRecovered: number;
  firstTrySuccesses: number;
  recoveryActionsCount: number;
  tasteFeedbackCount: number;
  secondAttemptRate: string;
  recoveryRate: string;
  eventualRecoveryRate: string;
}

export function calculateSessionFunnel(events: AnalyticsEvent[]): LiveFunnelMetrics {
  let uploadsStarted = 0;
  let uploadsValidated = 0;
  let generationStarts = 0;
  let recoveryActionsCount = 0;
  let tasteFeedbackCount = 0;

  // Track flows by flowId
  const flowMap = new Map<
    string,
    {
      hasAttempt1Started: boolean;
      hasAttempt1Failed: boolean;
      hasAttempt1Success: boolean;
      hasAttempt2Started: boolean;
      hasAttempt2Success: boolean;
      hasLaterSuccess: boolean;
    }
  >();

  const getFlowData = (flowId: string) => {
    if (!flowMap.has(flowId)) {
      flowMap.set(flowId, {
        hasAttempt1Started: false,
        hasAttempt1Failed: false,
        hasAttempt1Success: false,
        hasAttempt2Started: false,
        hasAttempt2Success: false,
        hasLaterSuccess: false,
      });
    }
    return flowMap.get(flowId)!;
  };

  events.forEach((ev) => {
    const flowId = ev.context?.flowId || 'default_flow';
    const attempt = ev.context?.attempt ?? (typeof ev.properties?.attempt === 'number' ? ev.properties.attempt : undefined);
    const flow = getFlowData(flowId);

    switch (ev.event) {
      case 'upload_started':
        uploadsStarted++;
        break;
      case 'upload_validated':
        uploadsValidated++;
        break;
      case 'generation_started':
        generationStarts++;
        if (attempt === 1) {
          flow.hasAttempt1Started = true;
        } else if (attempt === 2) {
          flow.hasAttempt2Started = true;
        }
        break;
      case 'generation_failed':
        if (attempt === 1) {
          flow.hasAttempt1Failed = true;
        }
        break;
      case 'try_on_success':
        if (attempt === 1) {
          flow.hasAttempt1Success = true;
        } else if (attempt === 2) {
          flow.hasAttempt2Success = true;
          flow.hasLaterSuccess = true;
        } else if (attempt && attempt > 2) {
          flow.hasLaterSuccess = true;
        }
        break;
      case 'recovery_upload_brighter_clicked':
      case 'recovery_upload_full_body_clicked':
      case 'recovery_upload_solo_clicked':
      case 'different_outfit_selected':
      case 'similar_style_selected':
      case 'retry_clicked':
        recoveryActionsCount++;
        break;
      case 'feedback_given':
      case 'look_saved':
      case 'show_next_look_clicked':
      case 'style_rejected':
      case 'taste_reset':
        tasteFeedbackCount++;
        break;
    }
  });

  let firstAttemptFailures = 0;
  let secondAttemptStarts = 0;
  let recoveredWithin2 = 0;
  let eventuallyRecovered = 0;
  let firstTrySuccesses = 0;

  flowMap.forEach((flow) => {
    if (flow.hasAttempt1Success && !flow.hasAttempt1Failed) {
      firstTrySuccesses++;
    }
    if (flow.hasAttempt1Failed) {
      firstAttemptFailures++;
      if (flow.hasAttempt2Started) {
        secondAttemptStarts++;
      }
      if (flow.hasAttempt2Success) {
        recoveredWithin2++;
      }
      if (flow.hasLaterSuccess) {
        eventuallyRecovered++;
      }
    }
  });

  const secondAttemptRate = firstAttemptFailures > 0
    ? `${((secondAttemptStarts / firstAttemptFailures) * 100).toFixed(1)}%`
    : 'Not enough session data';

  const recoveryRate = firstAttemptFailures > 0
    ? `${((recoveredWithin2 / firstAttemptFailures) * 100).toFixed(1)}%`
    : 'Not enough session data';

  const eventualRecoveryRate = firstAttemptFailures > 0
    ? `${((eventuallyRecovered / firstAttemptFailures) * 100).toFixed(1)}%`
    : 'Not enough session data';

  return {
    totalEvents: events.length,
    uniqueFlowsCount: flowMap.size,
    uploadsStarted,
    uploadsValidated,
    generationStarts,
    firstAttemptFailures,
    secondAttemptStarts,
    recoveredWithin2,
    eventuallyRecovered,
    firstTrySuccesses,
    recoveryActionsCount,
    tasteFeedbackCount,
    secondAttemptRate,
    recoveryRate,
    eventualRecoveryRate,
  };
}
