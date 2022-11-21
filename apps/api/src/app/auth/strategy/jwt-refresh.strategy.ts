import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { lastValueFrom, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(config: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      ignoreExpiration: !environment.production,
      passReqToCallback: true,
    });
  }

  validate(req: Request, { sub: id }: { sub: number }) {
    return lastValueFrom(
      this.authService
        .checkToken(req.get('Authorization').replace('Bearer ', ''))
        .pipe(
          tap((result) => {
            if (!result) throw new ForbiddenException('凭据过期');
          }),
          map(() => ({ id }))
        )
    );
  }
}