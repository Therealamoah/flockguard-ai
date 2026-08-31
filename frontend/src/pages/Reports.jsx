import { FileText, Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import UpgradePrompt from '../components/UpgradePrompt';
import { useFarmData } from '../context/farmDataStore';

export default function Reports() {
  const { reports, currentPlan } = useFarmData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        subtitle="Generated summaries you can share with your team or vet"
      />

      {!currentPlan.capabilities.reports ? (
        <UpgradePrompt feature="Reports" />
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} title="No reports yet" body="Reports are generated automatically each week once you have daily records logged." />
      ) : (
      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <Card key={report.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-brand-500">
                <FileText size={17} />
              </span>
              <div>
                <div className="font-medium text-ink">{report.title}</div>
                <div className="text-xs text-ink-muted">
                  {report.period} · Generated {report.generated}
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface">
              <Download size={14} />
              Download
            </button>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
