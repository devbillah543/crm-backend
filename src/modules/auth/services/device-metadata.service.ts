import { Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

export interface DeviceMetadata {
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  userAgent: string | null;
}

@Injectable()
export class DeviceMetadataService {
  fromRequest(request: AuthenticatedRequest, explicitDeviceName?: string): DeviceMetadata {
    const userAgentHeader = request.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader[0]
      : userAgentHeader ?? null;

    return {
      deviceName: explicitDeviceName?.trim() || this.inferDeviceName(userAgent),
      browser: this.inferBrowser(userAgent),
      os: this.inferOs(userAgent),
      ipAddress: this.extractIp(request),
      location: this.extractLocation(request),
      userAgent,
    };
  }

  private inferDeviceName(userAgent: string | null): string | null {
    if (!userAgent) {
      return null;
    }

    if (userAgent.includes('Mobile')) {
      return 'Mobile Device';
    }

    if (userAgent.includes('Tablet')) {
      return 'Tablet';
    }

    return 'Desktop Device';
  }

  private inferBrowser(userAgent: string | null): string | null {
    if (!userAgent) {
      return null;
    }

    if (userAgent.includes('Edg/')) {
      return 'Edge';
    }

    if (userAgent.includes('Chrome/')) {
      return 'Chrome';
    }

    if (userAgent.includes('Firefox/')) {
      return 'Firefox';
    }

    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      return 'Safari';
    }

    return 'Unknown';
  }

  private inferOs(userAgent: string | null): string | null {
    if (!userAgent) {
      return null;
    }

    if (userAgent.includes('Windows')) {
      return 'Windows';
    }

    if (userAgent.includes('Mac OS X')) {
      return 'macOS';
    }

    if (userAgent.includes('Android')) {
      return 'Android';
    }

    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS';
    }

    if (userAgent.includes('Linux')) {
      return 'Linux';
    }

    return 'Unknown';
  }

  private extractIp(request: AuthenticatedRequest): string | null {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0]?.trim() ?? null;
    }

    return request.ip ?? null;
  }

  private extractLocation(request: AuthenticatedRequest): string | null {
    const city = this.headerValue(request, 'x-vercel-ip-city');
    const region = this.headerValue(request, 'x-vercel-ip-country-region');
    const country =
      this.headerValue(request, 'x-vercel-ip-country') ??
      this.headerValue(request, 'cf-ipcountry') ??
      this.headerValue(request, 'x-country');

    return [city, region, country].filter(Boolean).join(', ') || null;
  }

  private headerValue(request: AuthenticatedRequest, key: string): string | null {
    const value = request.headers[key];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }
}
