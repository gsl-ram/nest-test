import { Injectable } from '@nestjs/common';
import { RolesService } from '../../modules/roles/roles.service';

const DEFAULT_ROLES = [
  {
    name: 'admin',
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
      jobs: { view: true, create: true, edit: true, delete: true },
      applications: { view: true, create: true, edit: true, delete: true },
      companies: { view: true, create: true, edit: true, delete: true },
      profiles: { view: true, create: true, edit: true, delete: true },
      admin: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    name: 'job_seeker',
    permissions: {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      jobs: { view: true, create: false, edit: false, delete: false },
      applications: { view: true, create: true, edit: false, delete: false },
      companies: { view: true, create: false, edit: false, delete: false },
      profiles: { view: true, create: true, edit: true, delete: false },
      admin: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    name: 'employer',
    permissions: {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      jobs: { view: true, create: true, edit: true, delete: true },
      applications: { view: true, create: false, edit: true, delete: false },
      companies: { view: true, create: true, edit: true, delete: true },
      profiles: { view: true, create: true, edit: true, delete: false },
      admin: { view: false, create: false, edit: false, delete: false },
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
