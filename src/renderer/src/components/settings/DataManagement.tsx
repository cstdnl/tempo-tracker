import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Download, Upload, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function DataManagement() {
  const handleExport = async () => {
    try {
      const data = await window.api.exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const confirmImport = window.confirm(
      'Are you sure you want to import data? This will REPLACE all your current tasks, collections, and time entries. This action cannot be undone.'
    )

    if (!confirmImport) {
      event.target.value = ''
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        const result = await window.api.importData(content)
        if (result.success) {
          alert('Data imported successfully! The application will now reload.')
          window.location.reload()
        } else {
          alert(`Import failed: ${result.error}`)
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import data')
    }
    event.target.value = ''
  }

  return (
    <Card className="shadow-sm bg-muted/2 rounded-(--radius)">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md">
            <Database className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">Data Management</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Backup your data or restore from a previous export.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Export Data</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Download a JSON file containing all your tasks, collections, and time entries. Recommended for regular backups.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-10 text-xs gap-2 rounded-(--radius) bg-background shadow-sm hover:bg-primary/3 hover:text-primary hover:border-primary/20 transition-all"
              onClick={handleExport}
            >
              <Download className="h-3.5 w-3.5" />
              Export Backup
            </Button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Import Data</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Restore your data from a previous backup file.
              </p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Import data"
              />
              <Button 
                variant="outline" 
                className="w-full h-10 text-xs gap-2 rounded-(--radius) bg-background shadow-sm transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                Import Backup
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-(--radius) bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-[11px] text-destructive font-medium">
            Important: Importing a data file will permanently replace all current data.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}