import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import '@fontsource-variable/inter';
import '@fontsource-variable/eb-garamond';
import '@fontsource-variable/eb-garamond/wght-italic.css';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Honour the OS "reduce motion" setting for every animation. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
