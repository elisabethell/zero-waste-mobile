import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, delay } from 'rxjs/operators';
import { SurplusFood } from '../types/food';

const filterFoodList = (list: SurplusFood[], query: string): SurplusFood[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return list;
  return list.filter(
    (item) =>
      item.foodName.toLowerCase().includes(clean) ||
      item.donorName.toLowerCase().includes(clean) ||
      item.donorType.toLowerCase().includes(clean)
  );
};

export const useFoodSearchRx = (allFoods: SurplusFood[]) => {
  const [filteredFoods, setFilteredFoods] = useState<SurplusFood[]>(allFoods);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const foodsRef = useRef(allFoods);
  const currentQueryRef = useRef<string>('');

  // Subject stabil yang bertahan antar render
  const searchSubject = useMemo(() => new Subject<string>(), []);

  // Sinkronisasi data saat Zustand store diperbarui tanpa menghilangkan filter aktif
  useEffect(() => {
    foodsRef.current = allFoods;
    if (currentQueryRef.current) {
      setFilteredFoods(filterFoodList(allFoods, currentQueryRef.current));
    } else {
      setFilteredFoods(allFoods);
    }
  }, [allFoods]);

  useEffect(() => {
    const subscription = searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          currentQueryRef.current = query;
          const result = filterFoodList(foodsRef.current, query);
          // Simulasi async stream
          return of(result).pipe(delay(200));
        })
      )
      .subscribe({
        next: (results) => {
          setFilteredFoods(results);
          setIsSearching(false);
        },
        error: () => {
          setIsSearching(false);
        },
      });

    // Zero Memory Leak: Unsubscribe subscription RxJS dan selesaikan subject saat unmount
    return () => {
      subscription.unsubscribe();
      searchSubject.complete();
    };
  }, [searchSubject]);

  const onSearchChange = useCallback(
    (text: string) => {
      setIsSearching(true);
      searchSubject.next(text);
    },
    [searchSubject]
  );

  return { filteredFoods, isSearching, onSearchChange };
};
