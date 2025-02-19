import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DisclaimerModalProps {
  isDisclaimerAccepted: boolean;
  setIsDisclaimerAccepted: (value: boolean) => void;
}

export default function DisclaimerModal({
  isDisclaimerAccepted,
  setIsDisclaimerAccepted,
}: DisclaimerModalProps) {
  const handleAccept = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setIsDisclaimerAccepted(true);
  };

  return (
    <AlertDialog open={!isDisclaimerAccepted} onOpenChange={() => {}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отказ от ответственности</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Все представленные материалы предназначены исключительно для
              образовательных целей. Содержимое сайта не имеет никакого
              отношения к СПбГУТ, его кафедре электроники (Э) или другим
              подразделениям, а также к виртуальной лаборатории Сальникова А. П.
              Да и вообще, все материалы (включая графические) являются
              выдумкой, сгенерированной с использованием ИИ. Любые совпадения с
              реальными материалами случайны.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAccept}>Ладно</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
