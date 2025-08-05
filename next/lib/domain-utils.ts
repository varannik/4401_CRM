// Domain utilities for webhook processing
export class DomainUtils {
  
  // Extract company information from email domain
  static extractCompanyDomainInfo(email: string): {
    domain: string;
    isPersonalEmail: boolean;
    companyHint: string;
  } {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    
    return {
      domain,
      isPersonalEmail: this.isPersonalEmailDomain(domain),
      companyHint: this.generateCompanyNameFromDomain(domain)
    };
  }
  
  // Check if domain is personal email provider
  private static isPersonalEmailDomain(domain: string): boolean {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'icloud.com', 'protonmail.com', 'aol.com', 'live.com',
      'msn.com', 'yandex.com', 'mail.com'
    ];
    
    return personalDomains.includes(domain);
  }
  
  // Generate company name from domain
  private static generateCompanyNameFromDomain(domain: string): string {
    // Don't generate company names for personal email providers
    if (this.isPersonalEmailDomain(domain)) {
      return 'Individual Contact';
    }
    
    // Enhanced company name generation for business domains
    const cleanDomain = domain
      .replace(/\.(com|org|net|edu|gov|co\.uk|co\.in|de|fr|jp|au|inc|ltd|corp|llc)$/i, '')
      .replace(/^www\./, '');
    
    // Handle subdomain patterns (e.g., sales.company.com -> Company)
    if (cleanDomain.includes('.')) {
      const parts = cleanDomain.split('.');
      // Take the main company part (usually the last meaningful part)
      const companyPart = parts[parts.length - 1];
      return this.formatCompanyName(companyPart);
    }
    
    return this.formatCompanyName(cleanDomain);
  }
  
  // Format company name properly
  private static formatCompanyName(name: string): string {
    return name
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  // Check if email domain belongs to your organization
  static isInternalDomain(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    const internalDomains = [
      '44.01.com',
      '44point01.com'
    ];
    
    return internalDomains.includes(domain);
  }
  
  // Get domain classification
  static classifyDomain(email: string): 'internal' | 'business' | 'personal' | 'unknown' {
    const domainInfo = this.extractCompanyDomainInfo(email);
    
    if (this.isInternalDomain(email)) {
      return 'internal';
    }
    
    if (domainInfo.isPersonalEmail) {
      return 'personal';
    }
    
    if (domainInfo.domain && !domainInfo.isPersonalEmail) {
      return 'business';
    }
    
    return 'unknown';
  }
}