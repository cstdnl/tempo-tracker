import { Card, CardContent } from "@/components/ui/card"
type ReportCardProps = {
  label: string
  data: string
}

export default function ReportCard({
  label,
  data
}: ReportCardProps): React.JSX.Element {

  return (
    <Card className="bg-muted/20 border-none shadow-none rounded-(--radius)">
        <CardContent className="px-4 py-2 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        <span className="text-sm font-bold text-muted-foreground">{data}</span>
        </CardContent>
    </Card>
  )
}
