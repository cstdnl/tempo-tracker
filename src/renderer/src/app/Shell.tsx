import React from 'react'

interface ShellProps {
  children: React.ReactNode
}

export default function Shell({ children }: ShellProps): React.JSX.Element {
    return (
      <div className="dark"
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }}
      >
        <main
          className="dark"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            gap: 16,
            maxWidth: 1000,
            margin: '0 auto'
          }}
        >
          {children}
        </main>
      </div>
    )
}