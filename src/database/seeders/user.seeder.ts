import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import { RolesService } from '../../modules/roles/roles.service';

@Injectable()
export class UserSeeder {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async seed(): Promise<void> {
    const existing = await this.usersService.findByUsername('admin');

    if (existing) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    const adminRole = await this.rolesService.findByName('admin');
    if (!adminRole) {
      throw new Error('Admin role not found. Run RoleSeeder first.');
    }

    await this.usersService.create({
      username: 'admin',
      email: 'admin@example.com',
      password: '1234',
      role: adminRole._id.toString(),
    });

    console.log('Admin user created successfully');
  }
}
