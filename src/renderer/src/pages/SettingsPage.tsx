import React from 'react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { AppearanceSettings } from '@/components/settings/AppearanceSettings'
import { LayoutSettings } from '@/components/settings/LayoutSettings'
import { DataManagement } from '@/components/settings/DataManagement'
import { Separator } from '@renderer/components/ui/separator'

export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="flex-1 flex flex-col min-h-0 fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-4 backdrop-blur-sm z-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight">Settings</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Manage your application preferences and data
          </p>
        </div>
      </div>
      
      <Separator className="w-full bg-muted-foreground/70 opacity-50" />

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl py-8 px-2 space-y-8 animate-in fade-in duration-500">
            <div className="grid gap-6">
              <AppearanceSettings />
              <LayoutSettings />
              <DataManagement />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 backdrop-blur-sm z-20 flex flex-col items-center gap-2 opacity-50">
        <Separator className="w-full bg-muted-foreground/70" />
        <div className="flex items-center pt-2 gap-4 text-[10px] font-medium uppercase tracking-widest">
          <span>Tracker v1.0.0</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Built with Electron & Shadcn UI</span>
        </div>
      </div>
    </div>
  )
}