import { FDJStore } from '@/types/store';

interface StorePopupProps {
  store: FDJStore;
  isVisited: boolean;
  onToggleVisited: () => void;
}

export default function StorePopup({ store, isVisited, onToggleVisited }: StorePopupProps) {
  return (
    <div className="p-2 min-w-[200px]">
      <h3 className="text-sm font-bold text-gray-900 mb-1">{store.name}</h3>
      <p className="text-xs text-gray-600 mb-1">{store.address}</p>
      <p className="text-xs text-gray-600 mb-3">{store.zip_code} {store.city}</p>
      
      <p className="text-xs font-semibold text-gray-800 mb-3">
        À {(store.distance_in_km).toFixed(2)} km
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisited();
        }}
        className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
          isVisited 
            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isVisited ? 'Marquer comme non visité' : 'Marquer comme visité'}
      </button>
    </div>
  );
}
