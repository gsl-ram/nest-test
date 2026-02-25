import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class JobsExpiryService {
  constructor(
    @InjectQueue('job-expiry') private jobExpiryQueue: { add: (name: string, data: object, opts: object) => Promise<unknown> },
  ) {}

  async scheduleExpiryCheck() {
    await this.jobExpiryQueue.add('close-expired', {}, {
      repeat: { cron: '0 * * * *' },
    });
  }
}
