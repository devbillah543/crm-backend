export const MODULE_PERMISSIONS = {
  company: ['read', 'manage'],
  organization: ['read', 'manage'],
  brand: ['read', 'manage'],
  role: ['read', 'manage'],
  user: ['read', 'manage'],
  call: ['read', 'manage'],
  call_log: ['read', 'manage'],
  lead_manual_update: ['read', 'manage'],
  level2_update: ['read', 'manage'],
  level2_history: ['read','manage'],
  fixed_lead: ['read', 'manage'],
  lead_stats: ['read'],
  sms: ['read', 'manage'],
  email: ['read', 'manage'],
  lead: ['read', 'manage'],
  additional_contact: ['read', 'manage'],
  currently_hot: ['read', 'manage'],
  recent_interest: ['read', 'manage'],
  ever_been_hot: ['read','manage'],
  unassigned_hot: ['read', 'manage'],
  closed_contact: ['read', 'manage'],
  audit_log: ['read'],
  dashboard: ['read'],
  notification: ['read', 'manage'],
  settings: ['read', 'manage'],
  queue: ['read', 'manage'],
} as const;

export type AppModuleKey = keyof typeof MODULE_PERMISSIONS;
export type AppActionKey = (typeof MODULE_PERMISSIONS)[AppModuleKey][number];

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

export const APP_MODULES = Object.keys(MODULE_PERMISSIONS) as AppModuleKey[];

export const PERMISSIONS_BY_MODULE: Record<AppModuleKey, PermissionDefinition[]> = APP_MODULES.reduce(
  (accumulator, moduleKey) => {
    accumulator[moduleKey] = MODULE_PERMISSIONS[moduleKey].map((action) =>
      definePermission(moduleKey, action),
    );
    return accumulator;
  },
  {} as Record<AppModuleKey, PermissionDefinition[]>,
);

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = APP_MODULES.flatMap(
  (moduleKey) => PERMISSIONS_BY_MODULE[moduleKey],
);

export const PERMISSION_CODES = PERMISSION_DEFINITIONS.map((permission) => permission.code);
const AGENT_MODULES: AppModuleKey[] = ['call', 'call_log', 'lead_manual_update'];

const agentPermissionCodes = PERMISSION_DEFINITIONS.filter((permission) =>
  AGENT_MODULES.includes(permission.module),
).map((permission) => permission.code);

const managerPermissionCodes = PERMISSION_DEFINITIONS.filter(
  (permission) => !AGENT_MODULES.includes(permission.module),
).map((permission) => permission.code);

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
    description: 'Administrative access across all CRM modules and operations.',
    isSystem: true,
    permissions: [...PERMISSION_CODES],
  },
  {
    code: 'manager',
    displayName: 'Manager',
    description: 'All permissions except the agent-only call and lead manual update modules.',
    isSystem: true,
    permissions: managerPermissionCodes,
  },
  {
    code: 'agent',
    displayName: 'Agent',
    description: 'Access limited to call, call log, and lead manual update modules.',
    isSystem: true,
    permissions: agentPermissionCodes,
  },
  {
    code: 'auditor',
    displayName: 'Auditor',
    description: 'Read-only access for audits, compliance, and investigation.',
    isSystem: true,
    permissions: PERMISSION_DEFINITIONS.filter((permission) => permission.action === 'read').map(
      (permission) => permission.code,
    ),
  },
];

function definePermission(module: AppModuleKey, action: AppActionKey): PermissionDefinition {
  return {
    code: `${module}.${action}`,
    module,
    action,
    displayName: `${capitalize(action)} ${toDisplayName(module)}`,
    description: buildDescription(module, action),
  };
}

function buildDescription(module: AppModuleKey, action: AppActionKey): string {
  return `${capitalize(action)} access for ${toDisplayName(module).toLowerCase()}.`;
}

function toDisplayName(module: AppModuleKey): string {
  return module
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
