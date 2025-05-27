import { queryAggregatedDailyLogsAmounts } from './utils/queries';

async function testQuery() {
  try {
    const params = {
      address: '0x47d74516b33ed5d70dde7119a40839f6fcc24e57',
      topic0: '0xf7823f78d472190ac0f94e11854ed334dce4a2e571e5f1bf7a8aec9469891d97',
      startDate: '2025-04-01',
      endDate: '2025-04-10'
    };

    const results = await queryAggregatedDailyLogsAmounts(params);
    console.log(results);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testQuery(); 