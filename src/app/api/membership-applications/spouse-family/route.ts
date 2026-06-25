import { NextResponse } from 'next/server';
import { lookupSpouseFamilyByIdNumber } from '@/lib/membership/family';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idNumber = searchParams.get('idNumber') ?? '';

  if (!idNumber.trim()) {
    return NextResponse.json({ error: 'ID number is required' }, { status: 400 });
  }

  const result = await lookupSpouseFamilyByIdNumber(idNumber);
  return NextResponse.json(result);
}
