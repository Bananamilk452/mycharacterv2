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

    return isPersisted;
  }

  const estimate = navigator.storage.estimate;

  return { ready, isPersistent, persist, estimate };
}
