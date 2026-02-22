import { Injectable } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class UserSeeder {
  constructor(private readonly usersService: UsersService) {}

  async seed(): Promise<void> {
    const existing = await this.usersService.findByUsername('admin');

    if (existing) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    await this.usersService.create({
      username: 'admin',
      email: 'admin@example.com',
      password: '1234',
      role: 'admin',
    });

    console.log('Admin user created successfully');
  }
}
