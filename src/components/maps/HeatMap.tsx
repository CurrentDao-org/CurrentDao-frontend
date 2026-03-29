import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HeatMapPoint, EnergyListing, MapBounds, Coordinates } from '../../types/maps';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Settings, 
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Info
} from 'lucide-react';
import { generateHeatMapData, optimizeMapPerformance } from '../../utils/mapHelpers';

interface HeatMapProps {
  listings: EnergyListing[];
  viewport: MapBounds | null;
  onHeatMapClick?: (point: HeatMapPoint) => void;
  className?: string;
  height?: string;
}

interface HeatMapConfig {
  intensity: 'low' | 'medium' | 'high';
  radius: number;
  blur: number;
  maxZoom: number;
  gradient: {
    [key: number]: string;
  };
}

const defaultGradients = {
  energy: {
    0.0: 'rgba(0, 0, 255, 0)',
    0.1: 'rgba(0, 255, 255, 0.5)',
    0.4: 'rgba(0, 255, 0, 0.6)',
    0.6: 'rgba(255, 255, 0, 0.7)',
    0.8: 'rgba(255, 165, 0, 0.8)',
    1.0: 'rgba(255, 0, 0, 1)',
  },
  price: {
    0.0: 'rgba(0, 255, 0, 0)',
    0.25: 'rgba(127, 255, 0, 0.5)',
    0.5: 'rgba(255, 255, 0, 0.7)',
    0.75: 'rgba(255, 127, 0, 0.8)',
    1.0: 'rgba(255, 0, 0, 1)',
  },
  capacity: {
    0.0: 'rgba(0, 0, 255, 0)',
    0.25: 'rgba(0, 127, 255, 0.5)',
    0.5: 'rgba(0, 255, 255, 0.7)',
    0.75: 'rgba(127, 255, 127, 0.8)',
    1.0: 'rgba(255, 255, 0, 1)',
  }
};

const HeatMapCanvas: React.FC<{
  points: HeatMapPoint[];
  config: HeatMapConfig;
  width: number;
  height: number;
  bounds: MapBounds;
  onPointClick?: (point: HeatMapPoint) => void;
}> = ({ points, config, width, height, bounds, onPointClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HeatMapPoint | null>(null);

  const latLngToPixel = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
    return { x, y };
  };

  const pixelToLatLng = (x: number, y: number): { lat: number; lng: number } => {
    const lng = bounds.west + (x / width) * (bounds.east - bounds.west);
    const lat = bounds.north - (y / height) * (bounds.north - bounds.south);
    return { lat, lng };
  };

  const drawHeatMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create intensity map
    const intensityMap = new Float32Array(width * height);
    const maxIntensity = Math.max(...points.map(p => p.intensity));

    // Calculate intensity for each point
    points.forEach((point) => {
      const { x, y } = latLngToPixel(point.coordinates.lat, point.coordinates.lng);
      const intensity = point.intensity / maxIntensity;

      // Apply gaussian blur effect
      const radius = config.radius * (width / 1000); // Scale radius with canvas size
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const px = Math.round(x + dx);
          const py = Math.round(y + dy);
          
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            const gaussian = Math.exp(-(distance * distance) / (2 * config.blur * config.blur));
            const mapIndex = py * width + px;
            intensityMap[mapIndex] = Math.min(1, intensityMap[mapIndex] + intensity * gaussian);
          }
        }
      }
    });

    // Draw heat map with gradient
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < intensityMap.length; i++) {
      const intensity = intensityMap[i];
      const color = getGradientColor(intensity, config.gradient);
      const pixelIndex = i * 4;
      
      data[pixelIndex] = color.r;
      data[pixelIndex + 1] = color.g;
      data[pixelIndex + 2] = color.b;
      data[pixelIndex + 3] = color.a;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getGradientColor = (intensity: number, gradient: { [key: number]: string }) => {
    // Find the two gradient points to interpolate between
    const sortedKeys = Object.keys(gradient)
      .map(parseFloat)
      .sort((a, b) => a - b);

    let lowerKey = 0;
    let upperKey = 1;

    for (let i = 0; i < sortedKeys.length - 1; i++) {
      if (intensity >= sortedKeys[i] && intensity <= sortedKeys[i + 1]) {
        lowerKey = sortedKeys[i];
        upperKey = sortedKeys[i + 1];
        break;
      }
    }

    const lowerColor = parseColor(gradient[lowerKey]);
    const upperColor = parseColor(gradient[upperKey]);
    const ratio = (intensity - lowerKey) / (upperKey - lowerKey);

    return {
      r: Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * ratio),
      g: Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * ratio),
      b: Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * ratio),
      a: Math.round((lowerColor.a + (upperColor.a - lowerColor.a) * ratio) * 255),
    };
  };

  const parseColor = (colorStr: string) => {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: parseFloat(match[4] || '1'),
      };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onPointClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find nearest point
    let nearestPoint: HeatMapPoint | null = null;
    let minDistance = Infinity;

    points.forEach((point) => {
      const { x: px, y: py } = latLngToPixel(point.coordinates.lat, point.coordinates.lng);
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      
      if (distance < minDistance && distance < 20) { // 20px threshold
        minDistance = distance;
        nearestPoint = point;
      }
    });

    if (nearestPoint) {
      onPointClick(nearestPoint);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find nearest point for hover
    let nearestPoint: HeatMapPoint | null = null;
    let minDistance = Infinity;

    points.forEach((point) => {
      const { x: px, y: py } = latLngToPixel(point.coordinates.lat, point.coordinates.lng);
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      
      if (distance < minDistance && distance < 20) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    setHoveredPoint(nearestPoint);
  };

  useEffect(() => {
    drawHeatMap();
  }, [points, config, width, height, bounds]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
        className="cursor-crosshair"
      />
      
      {hoveredPoint && (
        <div
          className="absolute bg-gray-900 text-white p-2 rounded shadow-lg text-sm pointer-events-none z-10"
          style={{
            left: latLngToPixel(hoveredPoint.coordinates.lat, hoveredPoint.coordinates.lng).x,
            top: latLngToPixel(hoveredPoint.coordinates.lat, hoveredPoint.coordinates.lng).y - 40,
          }}
        >
          <div>Intensity: {hoveredPoint.intensity.toFixed(2)}</div>
          {hoveredPoint.label && <div>{hoveredPoint.label}</div>}
          <div className="text-xs text-gray-300">
            {hoveredPoint.coordinates.lat.toFixed(4)}, {hoveredPoint.coordinates.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

const HeatMapStats: React.FC<{
  points: HeatMapPoint[];
  totalListings: number;
}> = ({ points, totalListings }) => {
  const stats = useMemo(() => {
    if (points.length === 0) {
      return {
        avgIntensity: 0,
        maxIntensity: 0,
        minIntensity: 0,
        totalIntensity: 0,
        hotspots: 0,
      };
    }

    const intensities = points.map(p => p.intensity);
    const avgIntensity = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    const maxIntensity = Math.max(...intensities);
    const minIntensity = Math.min(...intensities);
    const totalIntensity = intensities.reduce((sum, val) => sum + val, 0);
    const hotspots = points.filter(p => p.intensity > maxIntensity * 0.8).length;

    return {
      avgIntensity,
      maxIntensity,
      minIntensity,
      totalIntensity,
      hotspots,
    };
  }, [points]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 border-t border-gray-200">
      <div className="text-center">
        <div className="text-lg font-semibold text-blue-600">{points.length}</div>
        <div className="text-xs text-gray-600">Heat Points</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-green-600">{totalListings}</div>
        <div className="text-xs text-gray-600">Total Listings</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-orange-600">{stats.avgIntensity.toFixed(2)}</div>
        <div className="text-xs text-gray-600">Avg Intensity</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-red-600">{stats.maxIntensity.toFixed(2)}</div>
        <div className="text-xs text-gray-600">Max Intensity</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-purple-600">{stats.hotspots}</div>
        <div className="text-xs text-gray-600">Hotspots</div>
      </div>
    </div>
  );
};

export const HeatMapComponent: React.FC<HeatMapProps> = ({
  listings,
  viewport,
  onHeatMapClick,
  className = '',
  height = '400px',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [dataMode, setDataMode] = useState<'energy' | 'price' | 'capacity'>('energy');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [config, setConfig] = useState<HeatMapConfig>({
    intensity: 'medium',
    radius: 25,
    blur: 15,
    maxZoom: 17,
    gradient: defaultGradients.energy,
  });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Update canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height - 100) }); // Subtract space for controls
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Generate heat map data
  const heatMapPoints = useMemo(() => {
    if (!viewport) return [];

    const points = generateHeatMapData(listings, viewport);
    
    // Apply intensity multiplier based on mode
    return points.map((point) => {
      let adjustedIntensity = point.intensity;
      
      if (dataMode === 'price') {
        // Use price as intensity
        const avgPrice = listings.reduce((sum, l) => sum + l.price, 0) / listings.length;
        adjustedIntensity = (point.intensity * avgPrice) / 100; // Scale price to 0-100 range
      } else if (dataMode === 'capacity') {
        // Use capacity as intensity
        adjustedIntensity = Math.min(point.intensity * 2, 100); // Double capacity intensity
      }

      return {
        ...point,
        intensity: adjustedIntensity * (intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1),
      };
    });
  }, [listings, viewport, dataMode, intensity]);

  // Update config when mode changes
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      gradient: defaultGradients[dataMode],
      intensity,
    }));
  }, [dataMode, intensity]);

  const handleRefresh = () => {
    // Force re-render by updating config
    setConfig(prev => ({ ...prev }));
  };

  const handleExport = () => {
    const data = {
      points: heatMapPoints,
      config,
      viewport,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-${dataMode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Trading Activity Heat Map
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleExport}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isVisible && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Data Mode:</span>
                <select
                  value={dataMode}
                  onChange={(e) => setDataMode(e.target.value as typeof dataMode)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="energy">Energy Volume</option>
                  <option value="price">Price Levels</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Intensity:</span>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as typeof intensity)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Click on hotspots for details</span>
            </div>
          </div>

          <div ref={containerRef} className="relative" style={{ height }}>
            {viewport ? (
              <HeatMapCanvas
                points={heatMapPoints}
                config={config}
                width={canvasSize.width}
                height={canvasSize.height}
                bounds={viewport}
                onPointClick={onHeatMapClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                <div className="text-center">
                  <Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Adjust map view to generate heat map</p>
                </div>
              </div>
            )}
          </div>

          <HeatMapStats points={heatMapPoints} totalListings={listings.length} />
        </div>
      )}
    </div>
  );
};

export default HeatMapComponent;
