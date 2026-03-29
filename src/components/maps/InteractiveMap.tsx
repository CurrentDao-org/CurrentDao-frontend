import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useGeolocation } from '../../hooks/useGeolocation';
import { EnergyListing, MapMarker, UserLocation } from '../../types/maps';
import { formatDistance } from '../../utils/mapHelpers';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  listings: EnergyListing[];
  onMarkerClick?: (marker: MapMarker) => void;
  onViewportChange?: (viewport: any) => void;
  className?: string;
  height?: string;
  showUserLocation?: boolean;
  enableClustering?: boolean;
}

// Custom hook to handle map events
const MapEventHandler: React.FC<{
  onViewportChange: (viewport: any) => void;
  onMapClick: (latlng: any) => void;
}> = ({ onViewportChange, onMapClick }) => {
  const map = useMap();

  useMapEvents({
    click: (e) => onMapClick(e.latlng),
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      
      onViewportChange({
        center: { lat: center.lat, lng: center.lng },
        zoom,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
      });
    },
  });

  return null;
};

// Custom hook to sync map viewport with state
const MapViewportSync: React.FC<{ viewport: any }> = ({ viewport }) => {
  const map = useMap();

  useEffect(() => {
    if (viewport.center && viewport.zoom !== undefined) {
      map.setView([viewport.center.lat, viewport.center.lng], viewport.zoom);
    }
  }, [viewport.center, viewport.zoom, map]);

  return null;
};

// Custom marker component
const CustomMarker: React.FC<{
  marker: MapMarker;
  onClick: (marker: MapMarker) => void;
  isSelected: boolean;
}> = ({ marker, onClick, isSelected }) => {
  const getIcon = () => {
    if (marker.type === 'user') {
      return new Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
            <path d="M12 14C8 14 6 16 6 20H18C18 16 16 14 12 14Z" fill="white"/>
          </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    }

    if (marker.type === 'region') {
      return new Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#10B981" stroke="#059669" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${
              (marker.data as any).region?.substring(0, 2).toUpperCase() || 'RG'
            }</text>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    }

    const listing = marker.data as EnergyListing;
    const color = listing.available ? '#10B981' : '#EF4444';
    
    return new Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${color}" stroke="${color}" stroke-width="2" opacity="0.8"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">
            ${listing.type.substring(0, 2).toUpperCase()}
          </text>
        </svg>
      `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  const handleClick = () => {
    onClick(marker);
  };

  return (
    <Marker
      position={[marker.position.lat, marker.position.lng]}
      icon={getIcon()}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>
        <div className="p-2 min-w-48">
          {marker.type === 'listing' && (
            <>
              <h3 className="font-semibold text-gray-900 mb-2">
                {(marker.data as EnergyListing).title}
              </h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Type:</span> {(marker.data as EnergyListing).type}</p>
                <p><span className="font-medium">Price:</span> ${(marker.data as EnergyListing).price}/MWh</p>
                <p><span className="font-medium">Capacity:</span> {(marker.data as EnergyListing).capacity} MW</p>
                <p><span className="font-medium">Seller:</span> {(marker.data as EnergyListing).seller.name}</p>
                <p><span className="font-medium">Rating:</span> ⭐ {(marker.data as EnergyListing).seller.rating}</p>
                {(marker.data as EnergyListing).distance && (
                  <p><span className="font-medium">Distance:</span> {formatDistance((marker.data as EnergyListing).distance!, 'km')}</p>
                )}
                {(marker.data as EnergyListing).deliveryCost && (
                  <p><span className="font-medium">Delivery:</span> ${(marker.data as EnergyListing).deliveryCost!.toFixed(2)}</p>
                )}
              </div>
            </>
          )}
          
          {marker.type === 'user' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Location</h3>
              <p className="text-sm text-gray-600">
                Lat: {marker.position.lat.toFixed(6)}, Lng: {marker.position.lng.toFixed(6)}
              </p>
              <p className="text-sm text-gray-600">
                Accuracy: ±{(marker.data as UserLocation).accuracy}m
              </p>
            </div>
          )}
          
          {marker.type === 'region' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {(marker.data as any).region} Region
              </h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Avg Price:</span> ${(marker.data as any).averagePrice}/MWh</p>
                <p><span className="font-medium">Listings:</span> {(marker.data as any).totalListings}</p>
                <p><span className="font-medium">Capacity:</span> {(marker.data as any).totalCapacity} MW</p>
                <p><span className="font-medium">Trend:</span> 
                  <span className={`ml-1 ${
                    (marker.data as any).priceTrend === 'up' ? 'text-red-600' :
                    (marker.data as any).priceTrend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {(marker.data as any).priceTrend === 'up' ? '↑' :
                     (marker.data as any).priceTrend === 'down' ? '↓' : '→'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  listings,
  onMarkerClick,
  onViewportChange,
  className = '',
  height = '500px',
  showUserLocation = true,
  enableClustering = true,
}) => {
  const {
    location: userLocation,
    requestLocation,
    permission,
  } = useGeolocation();

  const {
    mapState,
    updateViewport,
    selectMarker,
    setUserLocation,
    getVisibleMarkers,
  } = useMapIntegration({
    listings,
    enableClustering,
  });

  const mapRef = useRef<any>(null);

  // Set user location when available
  useEffect(() => {
    if (showUserLocation && userLocation) {
      setUserLocation(userLocation);
    }
  }, [userLocation, showUserLocation, setUserLocation]);

  const handleViewportChange = useCallback((viewport: any) => {
    updateViewport(viewport);
    onViewportChange?.(viewport);
  }, [updateViewport, onViewportChange]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    selectMarker(marker);
    onMarkerClick?.(marker);
  }, [selectMarker, onMarkerClick]);

  const handleMapClick = useCallback((latlng: any) => {
    // Clear selection when clicking on map
    selectMarker(null);
  }, [selectMarker]);

  const handleLocationRequest = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  const visibleMarkers = getVisibleMarkers();

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {permission === 'denied' && (
        <div className="absolute top-4 left-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
          <p className="text-sm text-red-800">
            Location access denied. Some features may be limited.
          </p>
        </div>
      )}
      
      {permission === 'prompt' && showUserLocation && (
        <div className="absolute top-4 left-4 z-10 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm">
          <p className="text-sm text-blue-800 mb-2">
            Enable location to see nearby energy listings and calculate distances.
          </p>
          <button
            onClick={handleLocationRequest}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Enable Location
          </button>
        </div>
      )}

      {mapState.error && (
        <div className="absolute top-4 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
          <p className="text-sm text-red-800">{mapState.error}</p>
        </div>
      )}

      {mapState.isLoading && (
        <div className="absolute top-4 right-4 z-10 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}

      <MapContainer
        center={[mapState.viewport.center.lat, mapState.viewport.center.lng]}
        zoom={mapState.viewport.zoom}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler
          onViewportChange={handleViewportChange}
          onMapClick={handleMapClick}
        />
        
        <MapViewportSync viewport={mapState.viewport} />

        {visibleMarkers.map((marker) => (
          <CustomMarker
            key={marker.id}
            marker={marker}
            onClick={handleMarkerClick}
            isSelected={mapState.selectedMarker?.id === marker.id}
          />
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 text-xs">
        <div className="space-y-1">
          <p>Markers: {visibleMarkers.length}</p>
          {mapState.userLocation && (
            <p>Location: ±{mapState.userLocation.accuracy}m</p>
          )}
        </div>
      </div>
    </div>
  );
};
