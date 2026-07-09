export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function isNonEmptyString(str: any): str is string {
  return typeof str === 'string' && str.trim().length > 0;
}

export function isValidAgentType(type: string): boolean {
  const validTypes = [
    'processor', 'analyzer', 'executor', 'coordinator',
    'validator', 'designer', 'security', 'devops',
    'data-scientist', 'qa'
  ];
  return validTypes.includes(type);
}

export function isValidAgentStatus(status: string): boolean {
  const validStatuses = ['idle', 'active', 'busy', 'error', 'offline'];
  return validStatuses.includes(status);
}