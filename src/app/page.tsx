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
  const { content, isLoading, error } = useLabContent(selectedLab);
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
        className={isDisclaimerAccepted ? "" : "pointer-events-none opacity-50"}
      >
        <div className="content mt-4 mainPage p-1.5 mx-auto max-w-4xl min-h-[calc(100vh-8rem)]">
          <LabSelector onSelect={setSelectedLab} />
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : selectedLab ? (
            <ContentDisplay content={content} />
          ) : (
            <Infoboard />
          )}
        </div>
      </div>
    </>
  );
}
