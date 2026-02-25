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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @RequirePermission('companies', 'create')
  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.companiesService.create(createCompanyDto, userId);
  }

  @RequirePermission('companies', 'view')
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @RequirePermission('companies', 'view')
  @Get('my')
  findMyCompanies(@CurrentUser('userId') userId: string) {
    return this.companiesService.findByCreatedBy(userId);
  }

  @RequirePermission('companies', 'view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @RequirePermission('companies', 'edit')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.companiesService.update(id, updateCompanyDto, userId);
  }

  @RequirePermission('companies', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.companiesService.remove(id, userId);
  }
}
