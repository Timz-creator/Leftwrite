import { checkSubscription } from "@/services/payments/extensionPay";
import ExtPay from "extpay";

const extpay = ExtPay("leftwrite-test");

extpay.startBackground();

// Listen for trial start
extpay.onTrialStarted.addListener(async () => {
  console.log("Trial started!");
  await chrome.storage.local.set({
    isNewUser: false,
    trialStartedAt: new Date().toISOString(),
  });
  // Force refresh subscription status
  await checkSubscription();
});

// Listen for install event
chrome.runtime.onInstalled.addListener(async () => {
  const user = await extpay.getUser();
  // Set initial state
  await chrome.storage.local.set({
    isPremium: false,
    trialStartedAt: user.trialStartedAt || null,
    isNewUser: !user.trialStartedAt && !user.paid,
  });
});

extpay.onPaid.addListener((payload) => {
  console.log("Payment received!", payload);
  // Update storage directly
  chrome.storage.local.set({
    isPremium: true,
    needsPayment: false,
  });
});

// Listen for subscription status
extpay
  .getUser()
  .then((user) => {
    console.log("User subscription status:", user.paid);
  })
  .catch((err) => {
    console.error("Error getting user:", err);
  });
