import ExtPay from "extpay";

export const extpay = ExtPay("leftwrite-test");

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds

// Listen for payment status changes from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PAYMENT_STATUS_CHANGED") {
    // Trigger a re-check of subscription
    checkSubscription();
  }
});

export const checkSubscription = async () => {
  try {
    const user = await extpay.getUser();
    // If user has never interacted with ExtPay
    if (!user.trialStartedAt && !user.paid) {
      await chrome.storage.local.set({
        isPremium: false,
        trialStartedAt: null,
        needsPayment: false,
        isNewUser: true,
        analysisCount: 0,
      });
      return false;
    }

    const now = new Date();
    const hasActiveTrial =
      user.trialStartedAt &&
      now.getTime() - new Date(user.trialStartedAt).getTime() < SEVEN_DAYS;

    const hasAccess = user.paid || hasActiveTrial;
    const needsPayment = !hasAccess && user.trialStartedAt;

    await chrome.storage.local.set({
      isPremium: hasAccess,
      trialStartedAt: user.trialStartedAt,
      needsPayment,
      isNewUser: false,
      analysisCount: hasActiveTrial
        ? 0
        : (await chrome.storage.local.get("analysisCount")).analysisCount || 0,
    });
    return Boolean(hasAccess);
  } catch (error) {
    console.error("Error checking subscription:", error);
    await chrome.storage.local.set({
      isPremium: false,
      needsPayment: false,
      analysisCount: 0,
    });
    return false;
  }
};

export const openTrialOrPayment = async () => {
  try {
    const user = await extpay.getUser();
    const { isNewUser } = await chrome.storage.local.get("isNewUser");

    // Always show trial page for new users
    if (isNewUser) {
      extpay.openTrialPage();
      return;
    }

    const now = new Date();
    const trialExpired =
      user.trialStartedAt &&
      now.getTime() - new Date(user.trialStartedAt).getTime() >= SEVEN_DAYS;

    if (!user.trialStartedAt || trialExpired) {
      extpay.openTrialPage();
    } else {
      extpay.openPaymentPage();
    }
  } catch (error) {
    console.error("Error opening payment/trial page:", error);
  }
};

export const MONTHLY_LIMIT = 10;

export const checkAndIncrementUsage = async () => {
  try {
    const user = await extpay.getUser();
    // If in trial period, allow unlimited usage
    const now = new Date();
    const hasActiveTrial =
      user.trialStartedAt &&
      now.getTime() - new Date(user.trialStartedAt).getTime() < SEVEN_DAYS;

    if (hasActiveTrial) {
      return true; // Unlimited during trial
    }

    // If not paid, no access
    if (!user.paid) {
      return false;
    }

    const { analysisCount = 0, lastResetDate } = await chrome.storage.local.get(
      ["analysisCount", "lastResetDate"]
    );

    const resetDate = lastResetDate ? new Date(lastResetDate) : null;

    // Check if we need to reset (new month)
    if (!resetDate || resetDate.getMonth() !== now.getMonth()) {
      await chrome.storage.local.set({
        analysisCount: 1,
        lastResetDate: now.toISOString(),
      });
      return true;
    }

    // Check if under monthly limit
    if (analysisCount < MONTHLY_LIMIT) {
      await chrome.storage.local.set({
        analysisCount: analysisCount + 1,
      });
      return true;
    }

    return false; // Monthly limit reached
  } catch (error) {
    console.error("Error checking usage:", error);
    return false;
  }
};

export const getRemainingAnalyses = async () => {
  const user = await extpay.getUser();
  // If new user, show unlimited until they start trial
  if (!user.trialStartedAt && !user.paid) {
    return "∞";
  }

  // If in trial, show unlimited
  const now = new Date();
  const hasActiveTrial =
    user.trialStartedAt &&
    now.getTime() - new Date(user.trialStartedAt).getTime() < SEVEN_DAYS;

  if (hasActiveTrial) {
    return "∞";
  }

  // If not paid, show 0
  if (!user.paid) {
    return 0;
  }

  const { analysisCount = 0 } = await chrome.storage.local.get("analysisCount");
  return Math.max(0, MONTHLY_LIMIT - analysisCount);
};
