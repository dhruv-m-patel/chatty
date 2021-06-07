import connectToMongoose from '@alcumus/mongoose-lib';
import { HIGH_FIVE_SERVICE_DB_URL } from './constants';
import { extractTransformAndLoadEntitiesFromAlcumusPlatform } from './seed/extract';

connectToMongoose(HIGH_FIVE_SERVICE_DB_URL)().then(async () => {
  try {
    await extractTransformAndLoadEntitiesFromAlcumusPlatform();
    console.log('FINISHED RUNNING SCRIPT. ');
    console.log('Your high five database is now seeded.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    console.log(
      'Your high five database was not seeded successfully.  Please drop the database and attempt again.'
    );
    process.abort();
  }
});
