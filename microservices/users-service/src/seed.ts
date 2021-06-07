import connectToMongoose from '@alcumus/mongoose-lib';
import { USER_SERVICE_DB_URL } from './constants';
import { extractTransformAndLoadEntitiesFromAlcumusPlatform } from './seed/extract';

connectToMongoose(USER_SERVICE_DB_URL)().then(async () => {
  try {
    const results = await extractTransformAndLoadEntitiesFromAlcumusPlatform();
    console.log('FINISHED RUNNING SCRIPT. ');
    console.log(`Companies Added: ${results.companies.length}`);
    console.log(`Roles Added: ${results.employeeRoles.length}`);
    console.log(`Sites Added: ${results.companySites.length}`);
    console.log(`Users Added: ${results.users.length}`);
    console.log('Your users database is now seeded.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    console.log(
      'Your database was not seeded successfully.  Please drop the database and attempt again.'
    );
    process.abort();
  }
});
