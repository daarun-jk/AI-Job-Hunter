/**
 * Extracts first and last name from a LinkedIn profile URL.
 * e.g., https://www.linkedin.com/in/john-doe-123/ -> { firstName: 'John', lastName: 'Doe' }
 */
export const parseNameFromLinkedIn = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Remove query params and trailing slashes
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    
    // Extract the part after /in/
    const match = cleanUrl.match(/\/in\/([^\/]+)/i);
    if (!match || !match[1]) return null;
    
    const slug = match[1];
    
    // Split by dash
    const parts = slug.split('-');
    
    // Filter out trailing alphanumeric IDs usually added by LinkedIn (like 123a456b)
    // A simple heuristic: if a part contains numbers, ignore it and anything after it.
    let nameParts = [];
    for (let part of parts) {
      if (/\d/.test(part)) {
        break;
      }
      nameParts.push(part);
    }
    
    if (nameParts.length === 0) return null;
    
    // Capitalize first letter of each part
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    const firstName = capitalize(nameParts[0]);
    let lastName = '';
    if (nameParts.length > 1) {
      lastName = capitalize(nameParts[nameParts.length - 1]);
    }
    
    return { firstName, lastName };
  } catch (e) {
    console.error("Failed to parse LinkedIn URL", e);
    return null;
  }
};

/**
 * Generates an email address based on a format string.
 * format examples: first.last@company.com, flast@company.com, firstlast@company.com
 */
export const generateEmailFromFormat = (firstName, lastName, format) => {
  if (!firstName || !format || format === 'Could not determine') return '';
  
  try {
    const f = firstName.toLowerCase();
    const l = lastName ? lastName.toLowerCase() : '';
    
    // The format string gives us the domain and the structure.
    // E.g. "first.last@company.com"
    const parts = format.split('@');
    if (parts.length !== 2) return '';
    const formatUser = parts[0];
    const domain = parts[1];
    
    let generatedUser = formatUser.toLowerCase();
    
    if (generatedUser === 'first.last') generatedUser = `${f}.${l}`;
    else if (generatedUser === 'firstlast') generatedUser = `${f}${l}`;
    else if (generatedUser === 'f.last') generatedUser = `${f.charAt(0)}.${l}`;
    else if (generatedUser === 'flast') generatedUser = `${f.charAt(0)}${l}`;
    else if (generatedUser === 'first.l') generatedUser = `${f}.${l.charAt(0)}`;
    else if (generatedUser === 'firstl') generatedUser = `${f}${l.charAt(0)}`;
    else if (generatedUser === 'last.first') generatedUser = `${l}.${f}`;
    else if (generatedUser === 'first') generatedUser = f;
    else if (generatedUser === 'last') generatedUser = l;
    else {
      // Fallback: literal replacement
      generatedUser = generatedUser.replace('first', f).replace('last', l);
    }
    
    // Clean up any dangling separators (e.g., if last name was empty, "john." becomes "john")
    generatedUser = generatedUser.replace(/^[.\-_]+|[.\-_]+$/g, '');
    
    // If the generated user is empty, return empty
    if (!generatedUser) return '';
    
    return `${generatedUser}@${domain}`;
  } catch (e) {
    console.error("Failed to generate email from format", e);
    return '';
  }
};
