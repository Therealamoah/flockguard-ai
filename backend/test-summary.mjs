import 'dotenv/config';
import { sendDailySummaries } from './src/lib/dailySummary.js';

const result = await sendDailySummaries();
console.log('Result:', result);
