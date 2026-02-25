import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @RequirePermission('jobs', 'view')
  @Post(':jobId')
  save(
    @Param('jobId') jobId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.savedJobsService.save(userId, jobId);
  }

  @RequirePermission('jobs', 'view')
  @Get()
  findMySavedJobs(@CurrentUser('userId') userId: string) {
    return this.savedJobsService.findByUser(userId);
  }

  @RequirePermission('jobs', 'view')
  @Get(':jobId/check')
  checkSaved(
    @Param('jobId') jobId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.savedJobsService.isSaved(userId, jobId).then((saved) => ({
      saved,
    }));
  }

  @RequirePermission('jobs', 'view')
  @Delete(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('jobId') jobId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.savedJobsService.remove(userId, jobId);
  }
}
