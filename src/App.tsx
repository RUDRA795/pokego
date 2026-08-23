import React from 'react';
import { GameScreen } from './components/screens/GameScreen';

export const App: React.FC = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 select-none">
      <GameScreen />
    </div>
  );
};

export default App;
