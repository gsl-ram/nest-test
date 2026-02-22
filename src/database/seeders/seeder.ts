import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database.module';
import { UsersModule } from '../../modules/users/users.module';
import { UserSeeder } from './user.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
  ],
  providers: [UserSeeder],
})
class SeederModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
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
