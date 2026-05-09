import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

type TemplateName = 'verification-email' | 'password-reset' | 'security-alert';

@Injectable()
export class AuthMailTemplateService {
  buildVerificationEmail(name: string, verificationUrl: string): { subject: string; html: string } {
    return this.render('verification-email', {
      name: name || 'there',
      verificationUrl,
    });
  }

  buildPasswordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
    return this.render('password-reset', {
      name: name || 'there',
      resetUrl,
    });
  }

  buildSecurityAlertEmail(name: string, message: string): { subject: string; html: string } {
    return this.render('security-alert', {
      name: name || 'there',
      message,
    });
  }

  private render(templateName: TemplateName, variables: Record<string, string>) {
    const basePath = join(process.cwd(), 'src', 'modules', 'auth', 'templates', templateName);
    const subject = this.replaceVariables(
      readFileSync(`${basePath}.subject.txt`, 'utf8').trim(),
      variables,
    );
    const html = this.replaceVariables(readFileSync(`${basePath}.html`, 'utf8'), variables);

    return { subject, html };
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
      content,
    );
  }
}
