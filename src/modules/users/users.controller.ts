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
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('user.read')
  @Get()
  @ApiOperation({
    summary: 'List users',
    description: 'Returns paginated users with optional search and filters.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'admin@example.com' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiQuery({ name: 'roleCode', required: false, example: 'admin' })
  @ApiOkResponse({
    description: 'Users returned successfully.',
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: {
          items: [
            {
              id: 'de305d54-75b4-431b-adb2-eb6b9e546014',
              email: 'admin@example.com',
              firstName: 'Platform',
              lastName: 'Admin',
              fullName: 'Platform Admin',
              isActive: true,
              roles: ['admin'],
              permissions: ['user.read', 'user.manage'],
              brandIds: [],
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
  @ApiForbiddenResponse({ schema: { example: { success: false, message: 'Forbidden resource' } } })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('user.read')
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Returns a single user by its identifier.',
  })
  @ApiParam({ name: 'id', description: 'User identifier.' })
  @ApiOkResponse({
    description: 'User returned successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ schema: { example: { success: false, message: 'User not found' } } })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('user.manage')
  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user with optional roles and brand assignments.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({ schema: { example: { success: false, message: 'Email is already in use' } } })
  create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtUser) {
    return this.usersService.create(dto, user);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('user.manage')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates profile fields, roles, brands, active state, or password.',
  })
  @ApiParam({ name: 'id', description: 'User identifier.' })
  @ApiOkResponse({
    description: 'User updated successfully.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({ schema: { example: { success: false, message: 'Email is already in use' } } })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('user.manage')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user and removes related sessions, role assignments, brand mappings, and action tokens.',
  })
  @ApiParam({ name: 'id', description: 'User identifier.' })
  @ApiOkResponse({
    description: 'User deleted successfully.',
    schema: { example: { success: true, message: 'User deleted successfully' } },
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: JwtUser) {
    await this.usersService.remove(id, user);
    return { success: true, message: 'User deleted successfully' };
  }
}
