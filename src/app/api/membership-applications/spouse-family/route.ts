import { NextResponse } from 'next/server';
import { churchIdFromUrl } from '@/lib/church/tenant';
import { lookupSpouseFamilyByIdNumber } from '@/lib/membership/family';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idNumber = searchParams.get('idNumber') ?? '';
  const churchId = churchIdFromUrl(request.url);

  if (!idNumber.trim()) {
    return NextResponse.json({ error: 'ID number is required' }, { status: 400 });
  }
  if (!churchId) {
    return NextResponse.json({ error: 'Church is required' }, { status: 400 });
  }

  const result = await lookupSpouseFamilyByIdNumber(idNumber, churchId);
  return NextResponse.json(result);
}
