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
import { JobSeekerProfilesService } from './job-seeker-profiles.service';
import { CreateJobSeekerProfileDto } from './dto/create-job-seeker-profile.dto';
import { UpdateJobSeekerProfileDto } from './dto/update-job-seeker-profile.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('job-seeker-profiles')
export class JobSeekerProfilesController {
  constructor(
    private readonly jobSeekerProfilesService: JobSeekerProfilesService,
  ) {}

  @RequirePermission('profiles', 'create')
  @Post()
  create(
    @Body() createDto: CreateJobSeekerProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.jobSeekerProfilesService.create(createDto, userId);
  }

  @RequirePermission('profiles', 'view')
  @Get('me')
  findMyProfile(@CurrentUser('userId') userId: string) {
    return this.jobSeekerProfilesService.findMyProfile(userId);
  }

  @RequirePermission('profiles', 'view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobSeekerProfilesService.findOne(id);
  }

  @RequirePermission('profiles', 'edit')
  @Patch('me')
  updateMe(
    @Body() updateDto: UpdateJobSeekerProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.jobSeekerProfilesService.updateByUserId(userId, updateDto);
  }

  @RequirePermission('profiles', 'edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobSeekerProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.jobSeekerProfilesService.update(id, updateDto, userId);
  }

  @RequirePermission('profiles', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.jobSeekerProfilesService.remove(id, userId);
  }
}
