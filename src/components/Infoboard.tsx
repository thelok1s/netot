import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as Icons from "lucide-react";
import notifications from "@/data/infoboard.json";
import cat from "@/images/cat.svg";
import Image from "next/image";

export default function Infoboard() {
  return (
    <div className="flex flex-col border rounded-lg h-fit gap-4 p-4 mt-4 shadow-xs items-center">
      <h1 className="text-2xl">Новости проекта</h1>
      <div className="space-y-4">
        {notifications.notifications.map((notification) => {
          const IconComponent = Icons[notification.icon as keyof typeof Icons];

          return (
            <Alert key={notification.id}>
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription>{notification.text}</AlertDescription>
            </Alert>
          );
        })}
      </div>
      <Image className="opacity-30" src={cat} alt="zssoib{fake_flag_<3}" />
      <p className="text-muted-foreground">
        Выберите лабораторную работу из списка выше, чтобы начать
      </p>
    </div>
  );
}
