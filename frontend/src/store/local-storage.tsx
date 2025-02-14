import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string) {
  // Lire la valeur initiale depuis localStorage ou utiliser une valeur par défaut
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Erreur lors de la lecture de localStorage", error);
      return null;
    }
  });

  // Mettre à jour localStorage dès que la valeur change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Erreur lors de l'écriture dans localStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;
