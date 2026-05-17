/**
 * 地图导航与视图状态管理 Hook (ViewModel)
 * 负责管理首页在“地图模式”与“探索模式（院校大厅）”之间的切换，以及洲际侧边栏的开关状态
 */
import { useState } from 'react';

export function useMapNavigation() {
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [drawerContinent, setDrawerContinent] = useState(null);

  /**
   * 切换探索模式（院校大厅）状态
   * @param {boolean} val - 目标模式布尔值
   */
  const toggleExploreMode = (val) => {
    setIsExploreMode(val);
    setDrawerContinent(null); // 切换模式时自动关闭洲际抽屉
  };

  /**
   * 打开指定大洲的侧边栏抽屉
   * @param {string} id - 大洲的ID
   */
  const openContinent = (id) => setDrawerContinent(id);
  
  /**
   * 关闭洲际侧边栏抽屉
   */
  const closeDrawer = () => setDrawerContinent(null);

  return {
    isExploreMode,
    drawerContinent,
    toggleExploreMode,
    openContinent,
    closeDrawer
  };
}
