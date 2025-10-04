import RouteOptimizer from '../services/routeOptimizer';

// Test data for optimization testing
export const TEST_ROUTES = {
  stockholm: [
    {
      id: 'test_1',
      name: 'Vasa Museum',
      address: 'Galärvarvsvägen 14, Stockholm',
      location: { latitude: 59.3280, longitude: 18.0918 },
      visitDuration: 120,
      openingHours: { open: 10 * 60, close: 17 * 60 }
    },
    {
      id: 'test_2',
      name: 'Skansen',
      address: 'Djurgårdsslätten 49-51, Stockholm',
      location: { latitude: 59.3259, longitude: 18.1038 },
      visitDuration: 180,
      openingHours: { open: 10 * 60, close: 20 * 60 }
    },
    {
      id: 'test_3',
      name: 'ABBA Museum',
      address: 'Djurgårdsvägen 68, Stockholm',
      location: { latitude: 59.3252, longitude: 18.0963 },
      visitDuration: 90,
      openingHours: { open: 10 * 60, close: 18 * 60 }
    },
    {
      id: 'test_4',
      name: 'Royal Palace',
      address: 'Slottsbacken 1, Stockholm',
      location: { latitude: 59.3267, longitude: 18.0717 },
      visitDuration: 90,
      openingHours: { open: 10 * 60, close: 17 * 60 }
    },
    {
      id: 'test_5',
      name: 'Fotografiska',
      address: 'Stadsgårdshamnen 22, Stockholm',
      location: { latitude: 59.3176, longitude: 18.0851 },
      visitDuration: 60,
      openingHours: { open: 9 * 60, close: 21 * 60 }
    }
  ]
};

export const testOptimization = async (places = TEST_ROUTES.stockholm) => {
  console.log('🧪 Starting Optimization Test...');
  console.log(`📍 Testing with ${places.length} places`);

  const scheduleTypes = ['tight', 'balanced', 'relaxed'];
  const results = {};

  for (const scheduleType of scheduleTypes) {
    console.log(`\n🔍 Testing ${scheduleType} schedule...`);

    const startTime = Date.now();
    const result = await RouteOptimizer.optimizeRoute(places, {
      startTime: 9 * 60,
      scheduleType,
      considerOpeningHours: true
    });
    const endTime = Date.now();

    results[scheduleType] = {
      ...result,
      computationTime: endTime - startTime
    };

    console.log(`✅ ${scheduleType.toUpperCase()} Schedule Results:`);
    console.log(`   - Total Time: ${result.totalTimeText}`);
    console.log(`   - Travel Time: ${result.totalTravelTimeText}`);
    console.log(`   - Visit Time: ${result.totalVisitTimeText}`);
    console.log(`   - Start: ${result.startTime}, End: ${result.endTime}`);
    console.log(`   - Computation: ${endTime - startTime}ms`);
    console.log(`   - Route: ${result.optimizedPlaces.map(p => p.name).join(' → ')}`);

    if (result.warnings.length > 0) {
      console.log(`   ⚠️ Warnings: ${result.warnings.length}`);
    }

    if (result.insights.length > 0) {
      console.log(`   💡 Insights: ${result.insights.length}`);
    }
  }

  console.log('\n🎉 Optimization Test Complete!\n');
  return results;
};

export const compareOptimizations = (results) => {
  console.log('\n📊 Optimization Comparison:');
  console.log('┌─────────────┬──────────┬──────────────┬──────────────┐');
  console.log('│ Schedule    │ Duration │ Travel Time  │ Visit Time   │');
  console.log('├─────────────┼──────────┼──────────────┼──────────────┤');

  Object.entries(results).forEach(([type, result]) => {
    console.log(
      `│ ${type.padEnd(11)} │ ${result.totalTimeText.padEnd(8)} │ ${result.totalTravelTimeText.padEnd(12)} │ ${result.totalVisitTimeText.padEnd(12)} │`
    );
  });

  console.log('└─────────────┴──────────┴──────────────┴──────────────┘\n');
};