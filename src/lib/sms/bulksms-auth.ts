/** BulkSMS.com HTTP Basic auth — server only, never expose to client */

export function getBulkSmsAuthHeader(): string | null {
  const preEncoded = process.env.BULKSMS_BASIC_AUTH?.trim();
  if (preEncoded) {
    return preEncoded.startsWith('Basic ') ? preEncoded : `Basic ${preEncoded}`;
  }

  const tokenId = process.env.BULKSMS_TOKEN_ID?.trim();
  const tokenSecret = process.env.BULKSMS_TOKEN_SECRET?.trim();
  if (!tokenId || !tokenSecret) return null;

  const encoded = Buffer.from(`${tokenId}:${tokenSecret}`, 'utf8').toString('base64');
  return `Basic ${encoded}`;
}
