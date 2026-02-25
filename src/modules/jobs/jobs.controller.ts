import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @RequirePermission('jobs', 'create')
  @Post()
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.jobsService.create(createJobDto, userId);
  }

  @RequirePermission('jobs', 'view')
  @Get()
  findAll(@Query() searchDto: SearchJobsDto) {
    if (
      searchDto.skills ||
      searchDto.location ||
      searchDto.salaryMin != null ||
      searchDto.salaryMax != null ||
      searchDto.experienceLevel ||
      searchDto.employmentType ||
      searchDto.search ||
      searchDto.page ||
      searchDto.limit
    ) {
      return this.jobsService.search(searchDto);
    }
    return this.jobsService.findAll();
  }

  @RequirePermission('jobs', 'view')
  @Get('my')
  findMyJobs(@CurrentUser('userId') userId: string) {
    return this.jobsService.findByCreatedBy(userId);
  }

  @RequirePermission('jobs', 'view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @RequirePermission('jobs', 'edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.jobsService.update(id, updateJobDto, userId);
  }

  @RequirePermission('jobs', 'edit')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'DRAFT' | 'OPEN' | 'CLOSED',
    @CurrentUser('userId') userId: string,
  ) {
    return this.jobsService.updateStatus(id, status, userId);
  }

  @RequirePermission('jobs', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.jobsService.remove(id, userId);
  }
}
