import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @RequirePermission('admin', 'view')
  @Get('jobs/pending')
  getPendingJobs() {
    return this.adminService.getPendingJobs();
  }

  @RequirePermission('admin', 'view')
  @Get('companies/pending')
  getPendingCompanies() {
    return this.adminService.getPendingCompanies();
  }

  @RequirePermission('admin', 'edit')
  @Patch('companies/:id/verify')
  verifyCompany(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.verifyCompany(id, status || 'verified');
  }

  @RequirePermission('admin', 'edit')
  @Patch('jobs/:id/moderate')
  moderateJob(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.moderateJob(id, status || 'APPROVED');
  }

  @RequirePermission('admin', 'edit')
  @Patch('users/:id/ban')
  banUser(
    @Param('id') id: string,
    @Body('banned') banned: boolean,
  ) {
    return this.adminService.banUser(id, banned ?? true);
  }
}
