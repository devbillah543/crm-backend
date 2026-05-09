export const APP_MODULES = [
  'auth',
  'users',
  'roles',
  'permissions',
  'organizations',
  'brands',
  'companies',
  'leads',
  'reports',
  'notifications',
  'sessions',
  'audit_logs',
  'automation',
  'settings',
] as const;

export const APP_ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'manage',
  'export',
  'assign',
  'approve',
  'revoke',
] as const;

export type AppModuleKey = (typeof APP_MODULES)[number];
export type AppActionKey = (typeof APP_ACTIONS)[number];

export interface PermissionDefinition {
  code: string;
  module: AppModuleKey;
  action: AppActionKey;
  displayName: string;
  description: string;
}

export interface RoleDefinition {
  code: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export const PERMISSIONS_BY_MODULE: Record<AppModuleKey, PermissionDefinition[]> = {
  auth: [
    definePermission('auth', 'read', 'View auth configuration and status'),
    definePermission('auth', 'manage', 'Manage authentication and security flows'),
  ],
  users: [
    definePermission('users', 'read', 'View users'),
    definePermission('users', 'create', 'Create users'),
    definePermission('users', 'update', 'Update users'),
    definePermission('users', 'delete', 'Delete users'),
    definePermission('users', 'manage', 'Manage all user operations'),
  ],
  roles: [
    definePermission('roles', 'read', 'View roles'),
    definePermission('roles', 'create', 'Create roles'),
    definePermission('roles', 'update', 'Update roles'),
    definePermission('roles', 'delete', 'Delete roles'),
    definePermission('roles', 'manage', 'Manage all role operations'),
  ],
  permissions: [
    definePermission('permissions', 'read', 'View permissions'),
    definePermission('permissions', 'manage', 'Manage permission assignments and catalogs'),
  ],
  organizations: [
    definePermission('organizations', 'read', 'View organizations'),
    definePermission('organizations', 'create', 'Create organizations'),
    definePermission('organizations', 'update', 'Update organizations'),
    definePermission('organizations', 'delete', 'Delete organizations'),
    definePermission('organizations', 'manage', 'Manage all organization operations'),
  ],
  brands: [
    definePermission('brands', 'read', 'View brands'),
    definePermission('brands', 'create', 'Create brands'),
    definePermission('brands', 'update', 'Update brands'),
    definePermission('brands', 'delete', 'Delete brands'),
    definePermission('brands', 'assign', 'Assign users or leads to brands'),
    definePermission('brands', 'manage', 'Manage all brand operations'),
  ],
  companies: [
    definePermission('companies', 'read', 'View companies'),
    definePermission('companies', 'create', 'Create companies'),
    definePermission('companies', 'update', 'Update companies'),
    definePermission('companies', 'delete', 'Delete companies'),
    definePermission('companies', 'manage', 'Manage all company operations'),
  ],
  leads: [
    definePermission('leads', 'read', 'View leads'),
    definePermission('leads', 'create', 'Create leads'),
    definePermission('leads', 'update', 'Update leads'),
    definePermission('leads', 'delete', 'Delete leads'),
    definePermission('leads', 'assign', 'Assign leads'),
    definePermission('leads', 'export', 'Export leads'),
    definePermission('leads', 'manage', 'Manage all lead operations'),
  ],
  reports: [
    definePermission('reports', 'read', 'View reports'),
    definePermission('reports', 'export', 'Export reports'),
    definePermission('reports', 'manage', 'Manage reporting and dashboards'),
  ],
  notifications: [
    definePermission('notifications', 'read', 'View notifications'),
    definePermission('notifications', 'create', 'Create notifications'),
    definePermission('notifications', 'manage', 'Manage notification channels and delivery'),
  ],
  sessions: [
    definePermission('sessions', 'read', 'View active sessions'),
    definePermission('sessions', 'revoke', 'Revoke active sessions'),
    definePermission('sessions', 'manage', 'Manage all session activity'),
  ],
  audit_logs: [
    definePermission('audit_logs', 'read', 'View audit logs'),
    definePermission('audit_logs', 'export', 'Export audit logs'),
  ],
  automation: [
    definePermission('automation', 'read', 'View automation runs and jobs'),
    definePermission('automation', 'create', 'Create automation jobs'),
    definePermission('automation', 'update', 'Update automation jobs'),
    definePermission('automation', 'manage', 'Manage automation and workflows'),
  ],
  settings: [
    definePermission('settings', 'read', 'View platform settings'),
    definePermission('settings', 'update', 'Update platform settings'),
    definePermission('settings', 'manage', 'Manage all platform settings'),
  ],
};

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = APP_MODULES.flatMap(
  (moduleKey) => PERMISSIONS_BY_MODULE[moduleKey],
);

export const PERMISSION_CODES = PERMISSION_DEFINITIONS.map((permission) => permission.code);

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    code: 'super_admin',
    displayName: 'Super Admin',
    description: 'Full platform access across all modules and operations.',
    isSystem: true,
    permissions: [...PERMISSION_CODES],
  },
  {
    code: 'admin',
    displayName: 'Admin',
    description: 'Administrative access to most CRM operations.',
    isSystem: true,
    permissions: [
      'auth.manage',
      'users.manage',
      'roles.read',
      'permissions.read',
      'organizations.manage',
      'brands.manage',
      'companies.manage',
      'leads.manage',
      'reports.manage',
      'notifications.manage',
      'sessions.manage',
      'audit_logs.read',
      'automation.manage',
      'settings.manage',
    ],
  },
  {
    code: 'manager',
    displayName: 'Manager',
    description: 'Operational management access for leads, teams, and reporting.',
    isSystem: true,
    permissions: [
      'users.read',
      'brands.read',
      'companies.read',
      'leads.read',
      'leads.update',
      'leads.assign',
      'leads.export',
      'reports.read',
      'reports.export',
      'notifications.read',
      'sessions.read',
      'automation.read',
    ],
  },
  {
    code: 'agent',
    displayName: 'Agent',
    description: 'Day-to-day sales or support user with limited operational access.',
    isSystem: true,
    permissions: [
      'auth.read',
      'companies.read',
      'leads.read',
      'leads.update',
      'notifications.read',
      'sessions.read',
    ],
  },
  {
    code: 'auditor',
    displayName: 'Auditor',
    description: 'Read-only access for audits, compliance, and investigation.',
    isSystem: true,
    permissions: [
      'users.read',
      'roles.read',
      'permissions.read',
      'organizations.read',
      'brands.read',
      'companies.read',
      'leads.read',
      'reports.read',
      'notifications.read',
      'sessions.read',
      'audit_logs.read',
      'audit_logs.export',
      'automation.read',
    ],
  },
];

function definePermission(
  module: AppModuleKey,
  action: AppActionKey,
  description: string,
): PermissionDefinition {
  return {
    code: `${module}.${action}`,
    module,
    action,
    displayName: toDisplayName(module, action),
    description,
  };
}

function toDisplayName(module: AppModuleKey, action: AppActionKey): string {
  const readableModule = module
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return `${capitalize(action)} ${readableModule}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
