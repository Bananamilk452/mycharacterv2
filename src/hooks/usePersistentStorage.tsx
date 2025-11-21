import { useEffect, useState } from "react";

export function usePersistentStorage() {
  const [ready, setReady] = useState<boolean>(false);
  const [isPersistent, setIsPersistent] = useState<boolean>(false);

  useEffect(() => {
    navigator.storage.persisted().then((isPersisted) => {
      setIsPersistent(isPersisted);
      setReady(true);
    });
  }, []);

  async function persist() {
    const isPersisted = await navigator.storage.persist();
    setIsPersistent(isPersisted);

    if (!isPersisted && Notification && Notification.requestPermission) {
      // 크롬의 경우에는 알림 권한이 허가되면 영구 스토리지도 허가됨
      const isNotificationGranted = await Notification.requestPermission();

      if (isNotificationGranted === "granted") {
        const isPersistedAfterNotification = await navigator.storage.persist();
        setIsPersistent(isPersistedAfterNotification);
      }
    }
  }

  const estimate = navigator.storage.estimate;

  return { ready, isPersistent, persist, estimate };
}
