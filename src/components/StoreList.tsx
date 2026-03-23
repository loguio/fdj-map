import { FDJStore } from '@/types/store';
import { MapPin, CheckCircle2, Circle } from 'lucide-react';
import { useMemo } from 'react';

interface StoreListProps {
  stores: FDJStore[];
  visitedStores: Set<number>;
  onStoreClick: (store: FDJStore) => void;
}

export default function StoreList({ stores, visitedStores, onStoreClick }: StoreListProps) {
  const sortedStores = useMemo(() => {
    // Stores are already sorted by distance from API, but we can double check
    return [...stores].sort((a, b) => a.distance_in_km - b.distance_in_km);
  }, [stores]);

  if (stores.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>Aucun point de vente à proximité.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 overflow-y-auto h-full pb-20">
      {sortedStores.map((store) => {
        const isVisited = visitedStores.has(store.id);

        return (
          <div 
            key={store.id}
            onClick={() => onStoreClick(store)}
            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100 flex items-start justify-between group"
          >
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {store.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {store.address}, {store.city}
              </p>
              <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-full">
                {store.distance_in_km < 1 
                  ? `${(store.distance_in_km * 1000).toFixed(0)} m` 
                  : `${store.distance_in_km.toFixed(1)} km`}
              </div>
            </div>
            
            <div className="flex-shrink-0 pt-1">
              {isVisited ? (
                <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-50" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 group-hover:text-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
