import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermission';

export interface RequiredPermission {
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete';
}

export const RequirePermission = (module: string, action: RequiredPermission['action']) =>
  SetMetadata(PERMISSION_KEY, { module, action } as RequiredPermission);
