"use client";

import { useState, useSyncExternalStore } from "react";
import ContentDisplay from "@/components/ContentDisplay";
import LabSelector from "@/components/LabSelector";
import DisclaimerModal from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLabContent } from "@/hooks/useLabContent";
import Infoboard from "@/components/Infoboard";
import ScrollControls from "@/components/ScrollControls";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Page() {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [selectedLab, setSelectedLab] = useState<string>("");
  const { questionIds, hasLoadedIndex, isLoading, error } =
    useLabContent(selectedLab);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("disclaimerAccepted") === "true",
  );

  if (!mounted) {
    return null;
  }

  return (
    <>
      <DisclaimerModal
        isDisclaimerAccepted={isDisclaimerAccepted}
        setIsDisclaimerAccepted={setIsDisclaimerAccepted}
      />
      <div
        className={
          isDisclaimerAccepted
            ? "app-shell"
            : "app-shell pointer-events-none opacity-50"
        }
      >
        <div className="content app-main mainPage mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <LabSelector
            value={selectedLab}
            onSelect={setSelectedLab}
            onReset={() => setSelectedLab("")}
          />

          <div className="content-transition" aria-live="polite">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert variant="destructive" className="content-error-state mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : selectedLab && hasLoadedIndex ? (
              <ContentDisplay
                key={selectedLab}
                lab={selectedLab}
                questionIds={questionIds}
              />
            ) : selectedLab ? (
              <LoadingSkeleton />
            ) : (
              <Infoboard />
            )}
          </div>
        </div>
        {selectedLab && <ScrollControls />}
      </div>
    </>
  );
}
