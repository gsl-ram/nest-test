import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database.module';
import { RolesModule } from '../../modules/roles/roles.module';
import { UsersModule } from '../../modules/users/users.module';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RolesModule,
    UsersModule,
  ],
  providers: [RoleSeeder, UserSeeder],
})
class SeederModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    const roleSeeder = app.get(RoleSeeder);
    await roleSeeder.seed();

    const userSeeder = app.get(UserSeeder);
    await userSeeder.seed();

    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
