import { SeedRecordCreator } from '@alcumus/mongoose-lib';

export interface UserSeed {
  _id: string;
  email: string;
  isSystemUser?: boolean;
}

const userData: UserSeed[] = [
  {
    _id: SeedRecordCreator,
    email: 'administrator@alcumus.com',
    isSystemUser: true,
  },
  {
    _id: 'cf9835e5-ecc7-4cc4-81eb-e545fd9632a2',
    email: 'ammar.burhan@alcumus.com',
  },
  {
    _id: '205addda-ffb7-4ded-b5a0-856f52cbaae1',
    email: 'ceri.davies@ecompliance.com',
  },
  {
    _id: '4d5e4be7-1276-4e14-9705-013b15fd616d',
    email: 'nitish.mathur@alcumus.com',
  },
  {
    _id: 'd5dad4b4-ca05-41ff-afe8-7ebf809ba7c3',
    email: 'cat.kazmir@alcumus.com',
  },
  {
    _id: '71e45d9e-616b-49ea-bd61-163cd1f55322',
    email: 'manan.jadhav@alcumus.com',
  },
  {
    _id: 'b9b795a3-9220-4323-b55d-185ea0f8bf45',
    email: 'stephen.dixon@ecompliance.com',
  },
  {
    _id: 'fa25cb5d-a2bc-4e79-ac49-cc049431ec63',
    email: 'piyush.dewan@alcumus.com',
  },
  {
    _id: 'fb348736-1797-49aa-b640-2f4d4c2499f3',
    email: 'scott.jamieson@alcumus.com',
  },
  {
    _id: '16150e41-38d9-43b4-a841-12b15493cf1e',
    email: 'dhruv.m.patel@ecompliance.com',
  },
];

export function getUsers(): UserSeed[] {
  return userData;
}
