import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @RequirePermission('applications', 'create')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(
    @Body() createDto: CreateApplicationDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationsService.create(createDto, userId);
  }

  @RequirePermission('applications', 'view')
  @Get('my')
  findMyApplications(@CurrentUser('userId') userId: string) {
    return this.applicationsService.findBySeeker(userId);
  }

  @RequirePermission('applications', 'view')
  @Get('job/:jobId')
  findByJob(
    @Param('jobId') jobId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationsService.findByJob(jobId, userId);
  }

  @RequirePermission('applications', 'view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @RequirePermission('applications', 'edit')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationsService.updateStatus(id, updateDto.status as any, userId);
  }

  @RequirePermission('applications', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.applicationsService.remove(id, userId);
  }
}
