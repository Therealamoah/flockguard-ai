import 'dotenv/config';
import { supabaseAdmin } from './src/supabaseAdmin.js';
import { classifyRecord } from './src/lib/ai.js';

const FARM_ID = '69b0f0b7-15c0-4731-8319-da5711b8aaa6'; // Colnett

const DATES = ['2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'];

const FLOCKS = [
  {
    name: 'Broiler House 1',
    type: 'broilers',
    house: 'House 1',
    birds: 500,
    hatch_date: '2026-08-01',
    days: [
      { given: [58, 92], eaten: [55, 88], mortality: 1, wg: 50, temp: 27, hum: 60, behavior: 'normal', notes: '' },
      { given: [60, 95], eaten: [57, 91], mortality: 0, wg: 52, temp: 28, hum: 58, behavior: 'normal', notes: '' },
      { given: [62, 98], eaten: [59, 94], mortality: 1, wg: 53, temp: 27, hum: 62, behavior: 'normal', notes: '' },
      { given: [64, 101], eaten: [61, 97], mortality: 0, wg: 55, temp: 26, hum: 59, behavior: 'normal', notes: '' },
      { given: [66, 104], eaten: [63, 100], mortality: 1, wg: 56, temp: 28, hum: 61, behavior: 'normal', notes: '' },
      { given: [68, 107], eaten: [65, 103], mortality: 0, wg: 58, temp: 27, hum: 60, behavior: 'normal', notes: '' },
      { given: [70, 110], eaten: [67, 106], mortality: 1, wg: 59, temp: 29, hum: 63, behavior: 'normal', notes: '' },
      { given: [72, 113], eaten: [69, 109], mortality: 0, wg: 60, temp: 27, hum: 58, behavior: 'normal', notes: '' },
      { given: [74, 116], eaten: [71, 112], mortality: 1, wg: 61, temp: 28, hum: 60, behavior: 'normal', notes: '' },
    ],
  },
  {
    name: 'Layer House A',
    type: 'layers',
    house: 'House A',
    birds: 300,
    hatch_date: '2026-04-08',
    days: [
      { given: [35, 65], eaten: [34, 63], mortality: 0, eggs: 258, temp: 26, hum: 62, behavior: 'normal', notes: '' },
      { given: [35, 66], eaten: [34, 64], mortality: 0, eggs: 262, temp: 27, hum: 60, behavior: 'normal', notes: '' },
      { given: [36, 67], eaten: [35, 65], mortality: 1, eggs: 255, temp: 26, hum: 61, behavior: 'normal', notes: '' },
      { given: [36, 66], eaten: [35, 64], mortality: 0, eggs: 260, temp: 27, hum: 59, behavior: 'normal', notes: '' },
      { given: [35, 65], eaten: [34, 63], mortality: 0, eggs: 264, temp: 28, hum: 63, behavior: 'normal', notes: '' },
      { given: [36, 67], eaten: [35, 65], mortality: 0, eggs: 259, temp: 27, hum: 60, behavior: 'normal', notes: '' },
      { given: [35, 66], eaten: [34, 64], mortality: 1, eggs: 261, temp: 26, hum: 62, behavior: 'normal', notes: '' },
      { given: [36, 67], eaten: [35, 65], mortality: 0, eggs: 266, temp: 27, hum: 61, behavior: 'normal', notes: '' },
      { given: [36, 68], eaten: [35, 66], mortality: 0, eggs: 263, temp: 28, hum: 60, behavior: 'normal', notes: '' },
    ],
  },
  {
    name: 'Broiler House 2',
    type: 'broilers',
    house: 'House 2',
    birds: 450,
    hatch_date: '2026-08-06',
    days: [
      { given: [52, 82], eaten: [50, 79], mortality: 1, wg: 48, temp: 27, hum: 59, behavior: 'normal', notes: '' },
      { given: [54, 85], eaten: [52, 82], mortality: 0, wg: 50, temp: 28, hum: 60, behavior: 'normal', notes: '' },
      { given: [55, 87], eaten: [53, 84], mortality: 1, wg: 51, temp: 27, hum: 58, behavior: 'normal', notes: '' },
      { given: [57, 90], eaten: [55, 87], mortality: 0, wg: 53, temp: 26, hum: 61, behavior: 'normal', notes: '' },
      { given: [58, 92], eaten: [56, 89], mortality: 1, wg: 54, temp: 28, hum: 59, behavior: 'normal', notes: '' },
      { given: [60, 95], eaten: [58, 92], mortality: 0, wg: 55, temp: 27, hum: 60, behavior: 'normal', notes: '' },
      { given: [62, 97], eaten: [50, 85], mortality: 2, wg: 40, temp: 30, hum: 68, behavior: 'lethargic', notes: 'A few birds seem slower than the rest, off in a corner.' },
      { given: [63, 98], eaten: [42, 70], mortality: 4, wg: 30, temp: 32, hum: 71, behavior: 'reduced_appetite', notes: 'Noticeably less feed and water taken today, some birds not coming up to eat.' },
      { given: [64, 99], eaten: [35, 58], mortality: 7, wg: 20, temp: 33, hum: 74, behavior: 'huddling', notes: 'Several birds huddling together in one corner, visibly weak, much quieter than usual.' },
    ],
  },
];

for (const f of FLOCKS) {
  const { data: flock, error: flockErr } = await supabaseAdmin
    .from('flocks')
    .insert({ farm_id: FARM_ID, name: f.name, type: f.type, house: f.house, birds: f.birds, hatch_date: f.hatch_date, risk: 'low' })
    .select()
    .single();
  if (flockErr) throw flockErr;
  console.log(`Created flock: ${f.name} (${flock.id})`);

  const priorRecords = [];

  for (let i = 0; i < DATES.length; i++) {
    const date = DATES[i];
    const day = f.days[i];

    // Morning: feed/water given, no AI call -- matches the real app's morning path.
    const { error: amErr } = await supabaseAdmin.from('daily_records').insert({
      flock_id: flock.id,
      farm_id: FARM_ID,
      record_date: date,
      period: 'morning',
      feed_kg: day.given[0],
      water_l: day.given[1],
      mortality: 0,
      behavior: 'normal',
    });
    if (amErr) throw amErr;

    // Evening: run through the real AI classifier, exactly like the app would.
    const record = {
      feedKg: day.eaten[0],
      waterL: day.eaten[1],
      mortality: day.mortality,
      eggCount: f.type === 'layers' ? day.eggs : null,
      weightGainG: f.type !== 'layers' ? day.wg : null,
      temperature: day.temp,
      humidity: day.hum,
      behavior: day.behavior,
      notes: day.notes,
    };
    const morningRecord = { feedKg: day.given[0], waterL: day.given[1] };

    const { flagged, reasons } = await classifyRecord({
      record,
      flock: { name: f.name, type: f.type, house: f.house, birds: f.birds },
      priorRecords,
      morningRecord,
    });

    const { error: pmErr } = await supabaseAdmin.from('daily_records').insert({
      flock_id: flock.id,
      farm_id: FARM_ID,
      record_date: date,
      period: 'evening',
      feed_kg: record.feedKg,
      water_l: record.waterL,
      mortality: record.mortality,
      egg_count: record.eggCount,
      weight_gain_g: record.weightGainG,
      temperature: record.temperature,
      humidity: record.humidity,
      behavior: record.behavior,
      notes: record.notes,
      flagged,
      verified: flagged ? 'pending' : null,
      reasons,
    });
    if (pmErr) throw pmErr;

    console.log(`  ${date}: flagged=${flagged}${flagged ? ' -> ' + reasons.join(' | ') : ''}`);

    priorRecords.unshift({ date, feedKg: record.feedKg, waterL: record.waterL, mortality: record.mortality });
  }
}

console.log('\nDone.');
