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
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations-query.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller({ path: 'organizations', version: '1' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('organization.read')
  @Get()
  @ApiOperation({
    summary: 'List organizations',
    description: 'Returns paginated organizations with optional search and filters.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'sidago' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiOkResponse({
    description: 'Organizations returned successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: 'de305d54-75b4-431b-adb2-eb6b9e546014',
              code: 'sidago',
              displayName: 'Sidago CRM',
              description: 'Primary organization for internal CRM operations.',
              icon: '/storage/local/media/users/123/organizations/sidago-icon.png',
              isActive: true,
              createdAt: '2026-05-10T16:32:11.000Z',
              updatedAt: '2026-05-10T16:32:11.000Z',
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
  findAll(@Query() query: ListOrganizationsQueryDto) {
    return this.organizationsService.findAll(query);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('organization.read')
  @Get(':id')
  @ApiOperation({
    summary: 'Get organization by id',
    description: 'Returns a single organization by its identifier.',
  })
  @ApiParam({ name: 'id', description: 'Organization identifier.' })
  @ApiOkResponse({
    description: 'Organization returned successfully.',
    type: OrganizationResponseDto,
  })
  @ApiNotFoundResponse({ schema: { example: { success: false, message: 'Organization not found' } } })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('organization.manage')
  @Post()
  @ApiOperation({
    summary: 'Create organization',
    description: 'Creates a new organization with validated code, name, and optional icon.',
  })
  @ApiCreatedResponse({
    description: 'Organization created successfully.',
    type: OrganizationResponseDto,
  })
  @ApiConflictResponse({
    schema: { example: { success: false, message: 'Organization code already exists' } },
  })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('organization.manage')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update organization',
    description: 'Updates one or more organization fields.',
  })
  @ApiParam({ name: 'id', description: 'Organization identifier.' })
  @ApiOkResponse({
    description: 'Organization updated successfully.',
    type: OrganizationResponseDto,
  })
  @ApiConflictResponse({
    schema: { example: { success: false, message: 'Organization code already exists' } },
  })
  @ApiNotFoundResponse({ schema: { example: { success: false, message: 'Organization not found' } } })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('organization.manage')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete organization',
    description: 'Deletes an organization when it is no longer referenced by brands.',
  })
  @ApiParam({ name: 'id', description: 'Organization identifier.' })
  @ApiOkResponse({
    description: 'Organization deleted successfully.',
    schema: { example: { success: true, message: 'Organization deleted successfully' } },
  })
  @ApiConflictResponse({
    schema: {
      example: {
        success: false,
        message: 'Organization cannot be deleted while brands are assigned to it',
      },
    },
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.organizationsService.remove(id);
    return { success: true, message: 'Organization deleted successfully' };
  }
}
