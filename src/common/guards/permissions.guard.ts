import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_PERMISSION_KEY } from '../decorators/skip-permission.decorator';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const skipPermission = this.reflector.getAllAndOverride<boolean>(
      SKIP_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipPermission) {
      return true;
    }

    const requiredPermission =
      this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermission) {
      throw new ForbiddenException('No permission defined for this route');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Access denied');
    }

    const modulePermissions = user.permissions[requiredPermission.module];
    if (!modulePermissions || !modulePermissions[requiredPermission.action]) {
      throw new ForbiddenException(
        `You do not have permission to ${requiredPermission.action} ${requiredPermission.module}`,
      );
    }

    return true;
  }
}
