import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import AIDMCard from './components/AIDMCard';
import DiceCard from './components/DiceCard';
import CharacterCard from './components/CharacterCard';
import AdventureModuleCard from './components/AdventureModuleCard';
import 'react-grid-layout/css/styles.css';
import './App.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const App: React.FC = () => {
  const [layout, setLayout] = useState<Layout[]>([
    { i: 'ai-dm', x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 8 },        // Full left side
    { i: 'character', x: 6, y: 0, w: 6, h: 5, minW: 4, minH: 4 },     // Top right
    { i: 'dice', x: 6, y: 5, w: 6, h: 4, minW: 2, minH: 3 },          // Middle right
    { i: 'module', x: 6, y: 9, w: 6, h: 7, minW: 3, minH: 5 },        // Bottom right
  ]);

  // Load saved layout on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('dnd-layout');
    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to load saved layout');
      }
    }
  }, []);

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem('dnd-layout', JSON.stringify(newLayout));
  };

  return (
    <div className="app-container">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
        draggableHandle=".card-header"
      >
        <div key="ai-dm">
          <AIDMCard />
        </div>
        <div key="character">
          <CharacterCard />
        </div>
        <div key="module">
          <AdventureModuleCard />
        </div>
        <div key="dice">
          <DiceCard />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default App;