import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlert, Dices, type LucideIcon } from "lucide-react";
import notifications from "@/data/infoboard.json";
import cat from "@/images/cat.svg";
import Image from "next/image";

const notificationIcons: Record<string, LucideIcon> = {
  Dices,
  CircleAlert,
};

interface Notification {
  id: string;
  title: string;
  text: string;
  icon: string;
}

export default function Infoboard() {
  return (
    <section className="info-panel" aria-labelledby="news-title">
      <h1 id="news-title" className="info-panel-title">
        Новости проекта
      </h1>
      <div className="space-y-3">
        {(notifications.notifications as Notification[]).map((notification) => {
          const IconComponent = notificationIcons[notification.icon];

          return (
            <Alert key={notification.id} className="notice-card">
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription>{notification.text}</AlertDescription>
            </Alert>
          );
        })}
      </div>
      <Image className="info-panel-image" src={cat} alt="" />
      <p className="info-panel-hint">
        Выберите лабораторную работу из списка выше, чтобы начать
      </p>
    </section>
  );
}
