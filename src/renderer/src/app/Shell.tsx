import React from 'react'

interface ShellProps {
  children: React.ReactNode
}

export default function Shell({ children }: ShellProps): React.JSX.Element {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        {/* Draggable Title Bar Region */}
        <div 
          className="h-10 w-full shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} 
        />
        
        <main
          className="flex-1 flex flex-col px-5 pb-5 gap-4 max-w-[1000px] w-full mx-auto overflow-hidden"
        >
          {children}
        </main>
      </div>
    )
}