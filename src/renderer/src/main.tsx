import './main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './components/ThemeProvider'
import { CollectionProvider } from './contexts/CollectionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider storageKey="tracker-theme">
      <CollectionProvider>
        <App />
      </CollectionProvider>
    </ThemeProvider>
  </StrictMode>
)
