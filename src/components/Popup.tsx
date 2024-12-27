import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Book,
  LogOut,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { processUserText, ProcessedMessage } from "@/services/anthropic";
import { User } from "firebase/auth";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from "@/services/firebase/auth";
import { auth } from "@/services/firebase/config";
import {
  checkSubscription,
  openTrialOrPayment,
  checkAndIncrementUsage,
  getRemainingAnalyses,
  MONTHLY_LIMIT,
} from "@/services/payments/extensionPay";
import logo from "@/assets/logo.png";

export function Popup() {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [styleGuideText, setStyleGuideText] = useState("");
  const [styleCharacteristics, setStyleCharacteristics] = useState<string[]>(
    []
  );
  const [analysis, setAnalysis] = useState<ProcessedMessage["analysis"] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [remainingAnalyses, setRemainingAnalyses] = useState<number | "∞">(
    MONTHLY_LIMIT
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserSubscription = async () => {
      const hasSubscription = await checkSubscription();
      const { needsPayment, isNewUser, trialStartedAt } =
        await chrome.storage.local.get([
          "needsPayment",
          "isNewUser",
          "trialStartedAt",
        ]);

      console.log("Subscription Status:", {
        hasSubscription,
        needsPayment,
        isNewUser,
        trialStartedAt,
      });

      setIsPremium(hasSubscription);
      setNeedsPayment(needsPayment);
      setIsNewUser(isNewUser);
    };

    checkUserSubscription();
    const interval = setInterval(checkUserSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateRemainingAnalyses = async () => {
      const remaining = await getRemainingAnalyses();
      setRemainingAnalyses(remaining);
    };

    updateRemainingAnalyses();
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthError((error as Error).message);
    }
  };

  const handleSignUp = async () => {
    setAuthError(null);
    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      console.error("Sign up error:", error);
      setAuthError((error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    if (!isPremium || needsPayment || isNewUser) {
      openTrialOrPayment();
      return;
    }
    console.log("Starting analysis with input:", inputText);

    setIsLoading(true);
    try {
      // Get the stored style guide
      const { styleGuide } = await chrome.storage.local.get("styleGuide");
      console.log("Retrieved style guide:", styleGuide);

      const promptText = styleGuide
        ? `Please analyze this text following this style guide: ${styleGuide}\n\nText to analyze: ${inputText}`
        : `Please analyze this text: ${inputText}`;
      console.log("Sending prompt:", promptText);

      const canAnalyze = await checkAndIncrementUsage();
      if (!canAnalyze) {
        openTrialOrPayment();
        return;
      }

      const result = await processUserText(promptText);
      console.log("Received API result:", result);

      if (result) {
        setAnalysis(result.analysis);
        setIsAnalysisOpen(true);
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setIsLoading(false);
    }

    // Update remaining analyses after successful analysis
    const remaining = await getRemainingAnalyses();
    setRemainingAnalyses(remaining);
  };

  const handleTrainAssistant = async () => {
    if (!styleGuideText.trim()) return;

    setIsLoading(true);
    try {
      // Store the style guide in chrome.storage
      await chrome.storage.local.set({ styleGuide: styleGuideText });

      // Get style characteristics from the API
      const result = await processUserText(
        `Analyze this text and extract writing style characteristics: ${styleGuideText}`
      );
      if (result?.analysis?.styleGuidance?.vocabularySuggestions) {
        setStyleCharacteristics(
          result.analysis.styleGuidance.vocabularySuggestions
        );
        // Store characteristics for future use
        await chrome.storage.local.set({
          styleCharacteristics:
            result.analysis.styleGuidance.vocabularySuggestions,
        });
      }
    } catch (error) {
      console.error("Error training assistant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved style guide on component mount
  useEffect(() => {
    chrome.storage.local.get(
      ["styleGuide", "styleCharacteristics"],
      (result) => {
        if (result.styleGuide) {
          setStyleGuideText(result.styleGuide);
        }
        if (result.styleCharacteristics) {
          setStyleCharacteristics(result.styleCharacteristics);
        }
      }
    );
  }, []);

  return (
    <div className="w-[300px] h-[500px] overflow-y-auto p-4 bg-black text-white">
      <header className="flex flex-col gap-2 mb-4 sticky top-0 bg-black z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={logo} alt="Leftwrite Logo" className="h-7 w-7" />
            <h1 className="text-lg font-bold">Leftwrite</h1>
          </div>
          {!authLoading && user && (
            <Button
              variant="ghost"
              className="text-white hover:text-orange-500"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        {authLoading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : user ? (
          <div className="text-sm text-gray-400 text-right">{user.email}</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <p className="text-gray-400 mb-4">
              {isSignUp
                ? "Create an account"
                : "Sign in to use the AI Writer Assistant"}
            </p>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 bg-gray-900 text-white border-orange-500 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 bg-gray-900 text-white border-orange-500 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={isSignUp ? handleSignUp : handleSignIn}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <button
              className="text-orange-500 hover:text-orange-600 text-sm"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        )}
      </header>

      {!user && !authLoading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-gray-400 mb-4">
            Sign in to use the AI Writer Assistant
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSignIn}
          >
            Sign in with Google
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sticky top-12 bg-black z-10">
            <TabsTrigger
              value="analyze"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Analyze Draft
            </TabsTrigger>
            <TabsTrigger
              value="styleguide"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              My Style Guide
            </TabsTrigger>
          </TabsList>
          <TabsContent value="analyze" className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="draft-input"
                className="text-sm font-medium text-orange-500"
              >
                Paste your draft here:
              </label>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">
                  {remainingAnalyses === "∞"
                    ? "Unlimited analyses (Trial)"
                    : `Remaining analyses this month: ${remainingAnalyses}`}
                </span>
              </div>
              <Textarea
                id="draft-input"
                placeholder="Enter your draft content..."
                className="min-h-[150px] bg-gray-900 text-white border-orange-500 focus:ring-orange-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleAnalyze}
              disabled={isLoading || remainingAnalyses === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isLoading
                ? "Analyzing..."
                : remainingAnalyses === 0
                ? "Monthly Limit Reached"
                : "Analyze Draft"}
            </Button>
            <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  {isAnalysisOpen ? (
                    <>
                      Hide Analysis <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show Analysis <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold mb-2 text-orange-500">
                    Content Analysis
                  </h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-orange-500">
                      Title and Structure
                    </h4>
                    <p className="text-sm text-gray-400">
                      {analysis?.contentAnalysis.titleAndStructure ||
                        "No analysis available"}
                    </p>
                    <h4 className="text-sm font-medium text-orange-500">
                      Flow and Logic
                    </h4>
                    <p className="text-sm text-gray-400">
                      {analysis?.contentAnalysis.flowAndLogic ||
                        "No analysis available"}
                    </p>
                    <h4 className="text-sm font-medium text-orange-500">
                      Clarity Improvements
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                      {analysis?.contentAnalysis.clarityImprovements?.map(
                        (improvement, index) => (
                          <li key={index}>{improvement}</li>
                        )
                      ) || <li>No improvements available</li>}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-orange-500">
                    Style Guidance
                  </h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-orange-500">
                      Consistency
                    </h4>
                    <p className="text-sm text-gray-400">
                      {analysis?.styleGuidance.consistencyNotes ||
                        "No notes available"}
                    </p>
                    <h4 className="text-sm font-medium text-orange-500">
                      Voice Alignment
                    </h4>
                    <p className="text-sm text-gray-400">
                      {analysis?.styleGuidance.voiceAlignment ||
                        "No alignment analysis available"}
                    </p>
                    <h4 className="text-sm font-medium text-orange-500">
                      Vocabulary Suggestions
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                      {analysis?.styleGuidance.vocabularySuggestions?.map(
                        (suggestion, index) => <li key={index}>{suggestion}</li>
                      ) || <li>No suggestions available</li>}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-orange-500">
                    Readability Feedback
                  </h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-orange-500">
                      Overall Assessment
                    </h4>
                    <p className="text-sm text-gray-400">
                      {analysis?.readabilityFeedback.overallAssessment ||
                        "No assessment available"}
                    </p>
                    <h4 className="text-sm font-medium text-orange-500">
                      Structural Advice
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                      {analysis?.readabilityFeedback.structuralAdvice?.map(
                        (advice, index) => <li key={index}>{advice}</li>
                      ) || <li>No advice available</li>}
                    </ul>
                    <h4 className="text-sm font-medium text-orange-500">
                      Complexity Reduction
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                      {analysis?.readabilityFeedback.complexityReduction?.map(
                        (reduction, index) => <li key={index}>{reduction}</li>
                      ) || <li>No suggestions available</li>}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-orange-500">
                    Next Steps
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-400">
                    {analysis?.actionableSteps?.map((step, index) => (
                      <li key={index}>{step}</li>
                    )) || <li>No steps available</li>}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
          <TabsContent value="styleguide" className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="style-input"
                className="text-sm font-medium text-orange-500"
              >
                Paste a previous article to train your style guide:
              </label>
              <Textarea
                id="style-input"
                placeholder="Paste your article here..."
                className="min-h-[150px] bg-gray-900 text-white border-orange-500 focus:ring-orange-500"
                value={styleGuideText}
                onChange={(e) => setStyleGuideText(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleTrainAssistant}
              disabled={isLoading}
            >
              <Book className="mr-2 h-4 w-4" /> Train Assistant
            </Button>
            <div className="space-y-2">
              <h3 className="font-semibold">Extracted Style Characteristics</h3>
              <ul className="list-disc list-inside text-sm text-gray-400">
                {styleCharacteristics.map((characteristic, index) => (
                  <li key={index}>{characteristic}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-4 pt-4 border-t border-orange-500">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">AI Writer Assistant v1.0.0</p>
          <a
            href="mailto:support@example.com"
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpCircle className="h-3 w-3" />
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
// contains the popup component that renders the popup
// used for react component definitions
