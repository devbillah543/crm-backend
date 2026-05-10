import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CompaniesService } from './companies.service';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('company.read')
  @Get()
  @ApiOperation({
    summary: 'List companies',
    description: 'Returns paginated companies with optional search and filters.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'apple' })
  @ApiQuery({ name: 'companyType', required: false, example: 'Public' })
  @ApiQuery({ name: 'country', required: false, example: 'United States' })
  @ApiOkResponse({
    description: 'Companies returned successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: 'de305d54-75b4-431b-adb2-eb6b9e546014',
              companySymbol: 'AAPL',
              companyName: 'Apple Inc.',
              companyType: 'Public',
              country: 'United States',
              createdByUserId: 'd4e8b03b-fb64-4d8e-98e5-291016cf519d',
            },
          ],
          meta: { page: 1, limit: 20, total: 1 },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ schema: { example: { success: false, message: 'Unauthorized' } } })
  @ApiForbiddenResponse({
    schema: { example: { success: false, message: 'Forbidden resource' } },
  })
  findAll(@Query() query: ListCompaniesQueryDto) {
    return this.companiesService.findAll(query);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('company.read')
  @Get(':id')
  @ApiOperation({
    summary: 'Get company by id',
    description: 'Returns a single company by its identifier.',
  })
  @ApiParam({ name: 'id', description: 'Company identifier.' })
  @ApiOkResponse({
    description: 'Company returned successfully.',
    type: CompanyResponseDto,
  })
  @ApiNotFoundResponse({ schema: { example: { success: false, message: 'Company not found' } } })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companiesService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('company.manage')
  @Post()
  @ApiOperation({
    summary: 'Create company',
    description: 'Creates a company record and stamps the authenticated user as creator.',
  })
  @ApiCreatedResponse({
    description: 'Company created successfully.',
    type: CompanyResponseDto,
  })
  @ApiConflictResponse({
    schema: { example: { success: false, message: 'Company symbol already exists' } },
  })
  create(@Body() dto: CreateCompanyDto, @CurrentUser() user: JwtUser) {
    return this.companiesService.create(dto, user);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('company.manage')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update company',
    description: 'Updates one or more company fields.',
  })
  @ApiParam({ name: 'id', description: 'Company identifier.' })
  @ApiOkResponse({
    description: 'Company updated successfully.',
    type: CompanyResponseDto,
  })
  @ApiConflictResponse({
    schema: { example: { success: false, message: 'Company symbol already exists' } },
  })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('company.manage')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete company',
    description: 'Deletes a company record by its identifier.',
  })
  @ApiParam({ name: 'id', description: 'Company identifier.' })
  @ApiOkResponse({
    description: 'Company deleted successfully.',
    schema: { example: { success: true, message: 'Company deleted successfully' } },
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.companiesService.remove(id);
    return { success: true, message: 'Company deleted successfully' };
  }
}
