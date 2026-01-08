/**
 * Escapes special characters for use in a regular expression.
 * Prevents ReDoS and Regex Injection attacks.
 * @param {string} string 
 * @returns {string}
 */
export const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
