import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

/**
 * 现代风格的自定义 HTML 地图标记
 * 使用 Tailwind CSS 绘制发光动画与玻璃态拟物效果，替代传统的图片 Marker
 */
const createContinentMarker = (name) => {
  return L.divIcon({
    // 清除 leaflet 默认的白色方块背景和边框
    className: 'bg-transparent border-none', 
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <!-- 呼吸发光波纹 -->
        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50 group-hover:bg-pink-500 transition-colors"></div>
        <!-- 实体标签 -->
        <div class="relative bg-white/90 backdrop-blur-md shadow-2xl rounded-full px-5 py-2.5 border-2 border-blue-400 group-hover:border-pink-500 flex items-center gap-2 transform transition-transform group-hover:scale-110">
          <span class="text-sm font-black text-slate-800 tracking-wider">${name}</span>
        </div>
      </div>
    `,
    iconSize: [120, 40],   // 控制点击区域大小
    iconAnchor: [60, 20],  // 将锚点置于中心
  });
};

// 大洲对应的地理经纬度及标识
const continentMarkers = [
  { id: 'north-america', name: '北美洲', position: [45.0, -100.0] },
  { id: 'europe', name: '欧洲', position: [50.0, 15.0] },
  { id: 'asia', name: '亚洲', position: [40.0, 95.0] },
];

export function RealGlobalMap({ onContinentClick }) {
  // 视角中心点设为大西洋偏北，以便一览欧亚非美
  const mapCenter = [45.0, -20.0];
  const zoomLevel = 3;

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={zoomLevel} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#e0f3f8' }} // 淡蓝色水体背景
        minZoom={2}
        maxZoom={8} // 限制最大缩放级别，保持在宏观视图
        maxBounds={[[-85, -180], [85, 180]]} // 防止过度拖动导致地图重复
      >
        {/* 选用 CartoDB Voyager 风格底图：带有柔和地形和边界，适合商业/教育展示，科技感强 */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* 渲染大洲交互标记点 */}
        {continentMarkers.map((m) => (
          <Marker 
            key={m.id} 
            position={m.position} 
            icon={createContinentMarker(m.name)}
            eventHandlers={{
              click: () => onContinentClick(m.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9} className="rounded-lg shadow-lg font-bold text-slate-700">
              点击探索 {m.name} 院校库
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
