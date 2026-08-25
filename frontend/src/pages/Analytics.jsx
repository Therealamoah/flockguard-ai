import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import FeedChart from '../components/FeedChart';
import RiskDonut from '../components/RiskDonut';
import MortalityBarChart from '../components/MortalityBarChart';
import { feedConsumption7d, riskDistribution, flocks } from '../data/mockData';

const mortalityByFlock = flocks.map((f) => ({ name: f.name, value: f.mortalityRate }));

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" subtitle="Trends across your farm over the last 7 days" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Feed consumption — 7 days</h2>
          <Card className="px-4 py-4">
            <FeedChart data={feedConsumption7d} />
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">Mortality rate by flock</h2>
          <Card className="px-4 py-4">
            <MortalityBarChart data={mortalityByFlock} />
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-ink">Risk distribution</h2>
        <Card className="max-w-md px-5 py-5">
          <RiskDonut data={riskDistribution} />
        </Card>
      </div>
    </div>
  );
}
