import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';

function createContext(headers?: Record<string, string>) {
  const request = { headers: headers ?? {}, user: undefined };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let verify: ReturnType<typeof vi.fn>;
  let jwtService: JwtService;
  let guard: AuthGuard;

  beforeEach(() => {
    verify = vi.fn();
    jwtService = { verify } as unknown as JwtService;
    guard = new AuthGuard(jwtService);
  });

  describe('valid token', () => {
    it('should allow access and attach the decoded payload to the request', () => {
      const payload = { userId: 1, role: 'admin' };
      verify.mockReturnValue(payload);
      const context = createContext({ authorization: 'Bearer valid.token' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(verify).toHaveBeenCalledWith('valid.token', { secret: 'secret123' });
      expect(context.switchToHttp().getRequest().user).toEqual(payload);
    });
  });

  describe('missing authorization header', () => {
    it('should deny access without crashing', () => {
      const context = createContext();

      expect(() => guard.canActivate(context)).not.toThrow();
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('invalid or expired token', () => {
    it('should deny access and not attach a user', () => {
      verify.mockImplementation(() => {
        throw new Error('invalid token');
      });
      const context = createContext({ authorization: 'Bearer invalid.token' });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(context.switchToHttp().getRequest().user).toBeUndefined();
    });
  });

  describe('missing token after Bearer', () => {
    it('should deny access', () => {
      const context = createContext({ authorization: 'Bearer' });

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
