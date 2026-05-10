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
import { BrandsService } from './brands.service';
import { BrandResponseDto } from './dto/brand-response.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { ListBrandsQueryDto } from './dto/list-brands-query.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Brands')
@Controller({ path: 'brands', version: '1' })
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('brand.read')
  @Get()
  @ApiOperation({
    summary: 'List brands',
    description: 'Returns paginated brands with optional search and filters.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'sidago' })
  @ApiQuery({ name: 'organizationId', required: false, example: 'de305d54-75b4-431b-adb2-eb6b9e546014' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiOkResponse({
    description: 'Brands returned successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: 'de305d54-75b4-431b-adb2-eb6b9e546014',
              organizationId: 'f7f5abdd-d2d3-427c-a3d7-66e3b74b407e',
              code: 'sidago-primary',
              displayName: 'Sidago Primary',
              isActive: true,
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
  findAll(@Query() query: ListBrandsQueryDto) {
    return this.brandsService.findAll(query);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('brand.read')
  @Get(':id')
  @ApiOperation({
    summary: 'Get brand by id',
    description: 'Returns a single brand by its identifier.',
  })
  @ApiParam({ name: 'id', description: 'Brand identifier.' })
  @ApiOkResponse({
    description: 'Brand returned successfully.',
    type: BrandResponseDto,
  })
  @ApiNotFoundResponse({ schema: { example: { success: false, message: 'Brand not found' } } })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.brandsService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('brand.manage')
  @Post()
  @ApiOperation({
    summary: 'Create brand',
    description: 'Creates a brand inside an organization with optional parent-brand linkage.',
  })
  @ApiCreatedResponse({
    description: 'Brand created successfully.',
    type: BrandResponseDto,
  })
  @ApiConflictResponse({
    schema: { example: { success: false, message: 'Brand code already exists' } },
  })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('brand.manage')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update brand',
    description: 'Updates one or more brand fields and validates parent-brand rules.',
  })
  @ApiParam({ name: 'id', description: 'Brand identifier.' })
  @ApiOkResponse({
    description: 'Brand updated successfully.',
    type: BrandResponseDto,
  })
  @ApiNotFoundResponse({ schema: { example: { success: false, message: 'Brand not found' } } })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('brand.manage')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete brand',
    description: 'Deletes a brand when it is not referenced by dependent records.',
  })
  @ApiParam({ name: 'id', description: 'Brand identifier.' })
  @ApiOkResponse({
    description: 'Brand deleted successfully.',
    schema: { example: { success: true, message: 'Brand deleted successfully' } },
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.brandsService.remove(id);
    return { success: true, message: 'Brand deleted successfully' };
  }
}
