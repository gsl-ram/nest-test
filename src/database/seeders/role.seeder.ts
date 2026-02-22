import { Injectable } from '@nestjs/common';
import { RolesService } from '../../modules/roles/roles.service';

const DEFAULT_ROLES = [
  {
    name: 'admin',
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    name: 'user',
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
    },
  },
];

@Injectable()
export class RoleSeeder {
  constructor(private readonly rolesService: RolesService) {}

  async seed(): Promise<void> {
    for (const roleData of DEFAULT_ROLES) {
      const existing = await this.rolesService.findByName(roleData.name);

      if (existing) {
        console.log(`Role "${roleData.name}" already exists, skipping...`);
        continue;
      }

      await this.rolesService.create(roleData);
      console.log(`Role "${roleData.name}" created successfully`);
    }
  }
}
