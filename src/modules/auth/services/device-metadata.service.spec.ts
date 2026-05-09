import { DeviceMetadataService } from './device-metadata.service';

describe('DeviceMetadataService', () => {
  const service = new DeviceMetadataService();

  it('extracts browser, os, ip, and location from a request', () => {
    const metadata = service.fromRequest({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        'x-vercel-ip-city': 'Dhaka',
        'x-vercel-ip-country': 'BD',
      },
      ip: '127.0.0.1',
    } as never);

    expect(metadata.browser).toBe('Chrome');
    expect(metadata.os).toBe('Windows');
    expect(metadata.ipAddress).toBe('203.0.113.10');
    expect(metadata.location).toBe('Dhaka, BD');
    expect(metadata.deviceName).toBe('Desktop Device');
  });

  it('prefers an explicit device name when provided', () => {
    const metadata = service.fromRequest(
      {
        headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
        ip: '127.0.0.1',
      } as never,
      'Jane iPhone',
    );

    expect(metadata.deviceName).toBe('Jane iPhone');
  });
});
