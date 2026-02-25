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
import { EmployerProfilesService } from './employer-profiles.service';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('employer-profiles')
export class EmployerProfilesController {
  constructor(
    private readonly employerProfilesService: EmployerProfilesService,
  ) {}

  @RequirePermission('profiles', 'create')
  @Post()
  create(
    @Body() createDto: CreateEmployerProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.employerProfilesService.create(createDto, userId);
  }

  @RequirePermission('profiles', 'view')
  @Get('me')
  findMyProfile(@CurrentUser('userId') userId: string) {
    return this.employerProfilesService.findMyProfile(userId);
  }

  @RequirePermission('profiles', 'view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employerProfilesService.findOne(id);
  }

  @RequirePermission('profiles', 'edit')
  @Patch('me')
  updateMe(
    @Body() updateDto: UpdateEmployerProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.employerProfilesService.updateByUserId(userId, updateDto);
  }

  @RequirePermission('profiles', 'edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployerProfileDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.employerProfilesService.update(id, updateDto, userId);
  }

  @RequirePermission('profiles', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.employerProfilesService.remove(id, userId);
  }
}
