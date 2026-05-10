import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleResponseDto } from './dto/role-response.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('super_admin', 'admin')
  @Get()
  @ApiOperation({
    summary: 'List roles',
    description: 'Returns the available roles. Access is limited to super admin and admin users.',
  })
  @ApiOkResponse({
    description: 'Roles returned successfully.',
    type: RoleResponseDto,
    isArray: true,
    schema: {
      example: {
        success: true,
        message: 'Request successful',
        data: [
          {
            id: '7a76e0ec-bdf3-4503-b5cb-f0d2bfc48209',
            code: 'super_admin',
            displayName: 'Super Admin',
            description: 'Full platform access across all modules and operations.',
            isSystem: true,
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: { example: { success: false, message: 'Unauthorized' } },
  })
  @ApiForbiddenResponse({
    schema: { example: { success: false, message: 'Forbidden resource' } },
  })
  findAll() {
    return this.rolesService.findAll();
  }
}
