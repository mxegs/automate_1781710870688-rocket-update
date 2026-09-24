/**
 * Sample content for reviewing the CKC app.
 * Inserts through the same tables the admin/member screens use,
 * so records can be deleted later from Events, Sermons, Members, Prayer, etc.
 *
 * Marker: emails @ckc-sample.test and phones 0820000xxx
 * Does not send SMS or email.
 *
 * Run: node --env-file=.env scripts/seed-sample-content.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const SAMPLE_DOMAIN = 'ckc-sample.test';
const WATCH_URL = 'https://www.christkingdomcitizens.com/watch/';
const VENUE = {
  venue_name: 'CKC Midrand',
  venue_address: '75 Van Riebeek Street, Glen Austin',
  venue_city: 'Midrand',
  venue_directions_url: 'https://maps.google.com/?q=75+Van+Riebeek+Glen+Austin+Midrand',
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function iso(daysFromNow, hour = 8, minute = 30) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateOnly(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function birthdayThisWeek(offsetDays, year) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function ageFromDob(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function applicationPayload(person, campus) {
  const today = dateOnly(0);
  return {
    personal: {
      todayDate: today,
      surname: person.surname,
      fullName: person.full_name,
      username: person.username,
      campus,
      identityType: 'sa_id',
      identityNumber: person.idNumber,
      dateOfBirth: person.dob,
      age: person.age,
      permanentAddress: 'Glen Austin, Midrand',
      email: person.email,
      cellNo: person.phone,
      telNo: '',
      gender: person.gender,
      citizenship: 'RSA',
      countryOfOrigin: 'South Africa',
      maritalStatus: person.marital,
      occupation: [person.occupation],
      occupationOther: '',
      employer: person.employer,
      contactName: person.emergencyName,
      contactTel: person.emergencyPhone,
      idPhotoDataUrl: '',
    },
    guardian: {
      title: '',
      fullName: '',
      surname: '',
      identityNumber: '',
      familyGroupId: person.idNumber,
      relationship: '',
      telHome: '',
      telWork: '',
      streetAddress: '',
      occupation: '',
      organisation: '',
      spouseJoining: 'No',
      numberOfDependants: 0,
      dependants: [],
    },
    emergencyContact: {
      name: person.emergencyName,
      relationship: 'Spouse',
      phoneNumber: person.emergencyPhone,
    },
    spiritual: {
      acceptedChrist: 'Yes',
      baptized: person.baptised ? 'Yes' : 'No',
      baptismDate: person.baptised ? '2018-03-12' : '',
      baptismLocation: person.baptised ? 'CKC Midrand' : '',
      previousChurchMember: 'No',
      previousChurchName: '',
      previousChurchDate: '',
      previousChurchLocation: '',
      reasonForLeaving: '',
    },
    ministry: {
      areasOfInterest: person.ministry ? [person.ministry] : [],
      spiritualGifts: '',
      ministryPassions: '',
    },
    covenant: {
      agreedToCovenant: true,
      fullName: person.full_name,
      dateSigned: today,
      signatureDataUrl: '',
    },
  };
}

async function skipIfExists(db, table, column, value) {
  const { data } = await db.from(table).select('id').eq(column, value).limit(1).maybeSingle();
  return Boolean(data?.id);
}

async function main() {
  const db = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const summary = [];

  const people = [
    { surname: 'Molefe', full_name: 'Thabo Molefe', username: 'thabo.m', phone: '0820000101', email: `thabo.molefe@${SAMPLE_DOMAIN}`, gender: 'Male', dob: birthdayThisWeek(1, 1988), marital: 'Married', occupation: 'Employed', employer: 'City of Johannesburg', emergencyName: 'Nomsa Molefe', emergencyPhone: '0820000191', baptised: true, ministry: 'Media', campus: 'midrand', idNumber: '8809025800081' },
    { surname: 'Dlamini', full_name: 'Lerato Dlamini', username: 'lerato.d', phone: '0820000102', email: `lerato.dlamini@${SAMPLE_DOMAIN}`, gender: 'Female', dob: birthdayThisWeek(3, 1994), marital: 'Never Married', occupation: 'Employed', employer: 'Discovery', emergencyName: 'Thandi Dlamini', emergencyPhone: '0820000192', baptised: true, ministry: 'Hospitality', campus: 'midrand', idNumber: '9405120800084' },
    { surname: 'Nkosi', full_name: 'Sipho Nkosi', username: 'sipho.n', phone: '0820000103', email: `sipho.nkosi@${SAMPLE_DOMAIN}`, gender: 'Male', dob: '1991-06-18', marital: 'Married', occupation: 'Self Employed', employer: 'Nkosi Electrical', emergencyName: 'Zanele Nkosi', emergencyPhone: '0820000193', baptised: true, ministry: 'Ushers', campus: 'midrand', idNumber: '9106185800086' },
    { surname: 'Khumalo', full_name: 'Nomsa Khumalo', username: 'nomsa.k', phone: '0820000104', email: `nomsa.khumalo@${SAMPLE_DOMAIN}`, gender: 'Female', dob: '1986-11-02', marital: 'Married', occupation: 'Employed', employer: 'Department of Education', emergencyName: 'Bongani Khumalo', emergencyPhone: '0820000194', baptised: true, ministry: "Children's Church", campus: 'midrand', idNumber: '8611020800088' },
    { surname: 'Mthembu', full_name: 'Kagiso Mthembu', username: 'kagiso.m', phone: '0820000105', email: `kagiso.mthembu@${SAMPLE_DOMAIN}`, gender: 'Male', dob: '1996-04-21', marital: 'Never Married', occupation: 'Student', employer: 'University of Johannesburg', emergencyName: 'Mary Mthembu', emergencyPhone: '0820000195', baptised: true, ministry: 'Worship', campus: 'midrand', idNumber: '9604215800083' },
    { surname: 'Naidoo', full_name: 'Amahle Naidoo', username: 'amahle.n', phone: '0820000106', email: `amahle.naidoo@${SAMPLE_DOMAIN}`, gender: 'Female', dob: '2003-08-14', marital: 'Never Married', occupation: 'Student', employer: 'Midrand High', emergencyName: 'Priya Naidoo', emergencyPhone: '0820000196', baptised: false, ministry: 'Youth', campus: 'midrand', idNumber: '0308140800082' },
    { surname: 'Mahlangu', full_name: 'Precious Mahlangu', username: 'precious.m', phone: '0820000107', email: `precious.mahlangu@${SAMPLE_DOMAIN}`, gender: 'Female', dob: '1979-01-30', marital: 'Widow or Widower', occupation: 'Employed', employer: 'Netcare', emergencyName: 'Sibusiso Mahlangu', emergencyPhone: '0820000197', baptised: true, ministry: 'Prayer', campus: 'verulam', idNumber: '7901300800085' },
    { surname: 'Mabaso', full_name: 'David Mabaso', username: 'david.m', phone: '0820000108', email: `david.mabaso@${SAMPLE_DOMAIN}`, gender: 'Male', dob: '1984-09-09', marital: 'Married', occupation: 'Employed', employer: 'Transnet', emergencyName: 'Faith Mabaso', emergencyPhone: '0820000198', baptised: true, ministry: 'Security', campus: 'verulam', idNumber: '8409095800087' },
    { surname: 'van der Merwe', full_name: 'Annelise van der Merwe', username: 'annelise.v', phone: '0820000109', email: `annelise.vdm@${SAMPLE_DOMAIN}`, gender: 'Female', dob: '1990-02-11', marital: 'Married', occupation: 'Employed', employer: 'Absa', emergencyName: 'Johan van der Merwe', emergencyPhone: '0820000199', baptised: true, ministry: 'Women', campus: 'midrand', idNumber: '9002110800081' },
    { surname: 'Mokoena', full_name: 'Tshepo Mokoena', username: 'tshepo.m', phone: '0820000110', email: `tshepo.mokoena@${SAMPLE_DOMAIN}`, gender: 'Male', dob: '1998-12-05', marital: 'Never Married', occupation: 'Employed', employer: 'Takealot', emergencyName: 'Naledi Mokoena', emergencyPhone: '0820000180', baptised: false, ministry: 'Media', campus: 'midrand', idNumber: '9812055800089' },
  ];

  for (const person of people) {
    person.age = ageFromDob(person.dob);
    if (await skipIfExists(db, 'members', 'email', person.email)) {
      summary.push(`skip member ${person.full_name}`);
      continue;
    }
    const { error } = await db.from('members').insert({
      campus_id: person.campus,
      surname: person.surname,
      full_name: person.full_name,
      username: person.username,
      phone: person.phone,
      email: person.email,
      gender: person.gender,
      date_of_birth: person.dob,
      age: person.age,
      marital_status: person.marital,
      member_since: dateOnly(-40),
      covenant_signed_at: new Date().toISOString(),
      status: 'active',
    });
    if (error) throw new Error(`members ${person.full_name}: ${error.message}`);
    summary.push(`member ${person.full_name}`);
  }

  const pendingApps = [
    { surname: 'Botha', full_name: 'Carla Botha', username: 'carla.b', phone: '0820000111', email: `carla.botha@${SAMPLE_DOMAIN}`, gender: 'Female', dob: '1992-07-22', marital: 'Engaged', occupation: 'Employed', employer: 'Woolworths', emergencyName: 'Pieter Botha', emergencyPhone: '0820000181', baptised: true, ministry: 'Hospitality', campus: 'midrand', idNumber: '9207220800083' },
    { surname: 'Zulu', full_name: 'Bongani Zulu', username: 'bongani.z', phone: '0820000112', email: `bongani.zulu@${SAMPLE_DOMAIN}`, gender: 'Male', dob: '1987-03-08', marital: 'Married', occupation: 'Employed', employer: 'Eskom', emergencyName: 'Thuli Zulu', emergencyPhone: '0820000182', baptised: true, ministry: 'Ushers', campus: 'verulam', idNumber: '8703085800084' },
  ];

  for (const person of pendingApps) {
    person.age = ageFromDob(person.dob);
    if (await skipIfExists(db, 'membership_applications', 'phone', person.phone)) {
      summary.push(`skip application ${person.full_name}`);
      continue;
    }
    const { error } = await db.from('membership_applications').insert({
      phone: person.phone,
      campus_id: person.campus,
      status: 'submitted',
      application_data: applicationPayload(person, person.campus),
      submitted_at: iso(-2, 14, 10),
    });
    if (error) throw new Error(`application ${person.full_name}: ${error.message}`);
    summary.push(`application ${person.full_name}`);
  }

  const inviteRequests = [
    { surname: 'Petersen', full_name: 'Megan Petersen', email: `megan.petersen@${SAMPLE_DOMAIN}`, campus_id: 'midrand', phone: '0820000113' },
    { surname: 'Govender', full_name: 'Ravi Govender', email: `ravi.govender@${SAMPLE_DOMAIN}`, campus_id: 'verulam', phone: '0820000114' },
  ];
  for (const row of inviteRequests) {
    if (await skipIfExists(db, 'invite_requests', 'email', row.email)) {
      summary.push(`skip invite request ${row.full_name}`);
      continue;
    }
    const { error } = await db.from('invite_requests').insert({
      ...row,
      status: 'pending',
      notes: 'Sample invite request — delete from Members → Requests',
    });
    if (error) throw new Error(`invite_requests ${row.full_name}: ${error.message}`);
    summary.push(`invite request ${row.full_name}`);
  }

  const events = [
    {
      title: 'Sunday Worship Service',
      description: 'Join us as we gather to worship, hear the Word, and pray together as a church family.',
      event_info: 'Doors open at 08:00. Children\'s Church runs during the message.',
      campus_id: 'midrand',
      visibility: 'church_wide',
      category: 'Sunday Service',
      location: 'CKC Midrand sanctuary',
      starts_at: iso(4, 8, 30),
      ends_at: iso(4, 10, 30),
      capacity: 280,
      is_paid: false,
      important_info: 'Parking is available behind the hall. First-time guests, please visit the welcome table.',
    },
    {
      title: 'Midweek Prayer Meeting',
      description: 'A midweek gathering to seek God together for our families, city, and church.',
      event_info: 'Open prayer, short Word, and ministry time.',
      campus_id: 'midrand',
      visibility: 'campus_only',
      category: 'Prayer Meeting',
      location: 'CKC Midrand prayer room',
      starts_at: iso(5, 17, 30),
      ends_at: iso(5, 19, 0),
      capacity: 80,
      is_paid: false,
      important_info: 'Please arrive a few minutes early so we can start in worship.',
    },
    {
      title: 'Friday Youth Gathering',
      description: 'Youth night with worship, teaching, and small groups. Bring a friend.',
      event_info: 'Ages 13–18. Parents may collect from 20:30 at the main entrance.',
      campus_id: 'midrand',
      visibility: 'campus_only',
      category: 'Youth Event',
      location: 'CKC Youth hall',
      starts_at: iso(9, 18, 0),
      ends_at: iso(9, 20, 30),
      capacity: 60,
      is_paid: false,
      important_info: 'Please RSVP so we can plan food.',
    },
    {
      title: 'Women\'s Breakfast',
      description: 'A morning of fellowship, testimony, and the Word for the women of CKC.',
      event_info: 'Tea and breakfast provided. Childcare is not available for this sitting.',
      campus_id: 'midrand',
      visibility: 'members_only',
      category: "Women's Ministry",
      location: 'CKC fellowship hall',
      starts_at: iso(17, 8, 0),
      ends_at: iso(17, 10, 30),
      capacity: 50,
      is_paid: true,
      price_cents: 12000,
      important_info: 'Cost is R120 for breakfast. Please RSVP by the Wednesday before.',
    },
    {
      title: 'Men\'s Breakfast',
      description: 'Brothers gathering around the table for encouragement and prayer.',
      event_info: 'Short talk, table discussion, and coffee.',
      campus_id: 'midrand',
      visibility: 'members_only',
      category: "Men's Ministry",
      location: 'CKC fellowship hall',
      starts_at: iso(18, 7, 30),
      ends_at: iso(18, 9, 30),
      capacity: 40,
      is_paid: false,
      important_info: 'Arrive by 07:20 so we can start on time.',
    },
    {
      title: 'Glen Austin Outreach Saturday',
      description: 'Prayer walking and practical help in the streets around the campus.',
      event_info: 'Meet at the sanctuary steps. Wear comfortable shoes and bring water.',
      campus_id: 'midrand',
      visibility: 'church_wide',
      category: 'Outreach',
      location: 'Glen Austin neighbourhood',
      starts_at: iso(24, 9, 0),
      ends_at: iso(24, 12, 0),
      capacity: 35,
      is_paid: false,
      important_info: 'We will return to church for a short debrief and lunch.',
    },
    {
      title: 'Kingdom Conference',
      description: 'A joint CKC weekend of teaching, worship, and ministry with both campuses.',
      event_info: 'Friday evening and Saturday sessions. Livestream available for those who cannot attend.',
      campus_id: 'midrand',
      visibility: 'church_wide',
      category: 'Conference',
      location: 'CKC Midrand sanctuary',
      starts_at: iso(38, 18, 0),
      ends_at: iso(39, 16, 0),
      capacity: 400,
      is_paid: false,
      important_info: 'RSVP so we can print name tags and plan seating.',
    },
    {
      title: 'Verulam Sunday Service',
      description: 'Sunday gathering at the Verulam campus.',
      event_info: 'Hospitality team will meet first-time guests after the service.',
      campus_id: 'verulam',
      visibility: 'campus_only',
      category: 'Sunday Service',
      location: 'CKC Verulam',
      starts_at: iso(4, 9, 0),
      ends_at: iso(4, 11, 0),
      capacity: 160,
      is_paid: false,
      important_info: '',
    },
  ];

  const eventIds = [];
  for (const event of events) {
    const { data: existing } = await db.from('events').select('id').eq('title', event.title).limit(1).maybeSingle();
    if (existing?.id) {
      eventIds.push(existing.id);
      summary.push(`skip event ${event.title}`);
      continue;
    }
    const { data, error } = await db
      .from('events')
      .insert({
        ...event,
        ...VENUE,
        currency: 'ZAR',
        reminder_hours_before: 24,
      })
      .select('id')
      .single();
    if (error) throw new Error(`event ${event.title}: ${error.message}`);
    eventIds.push(data.id);
    summary.push(`event ${event.title}`);
  }

  const rsvpNames = [
    { name: 'Thabo Molefe', phone: '0820000101', email: `thabo.molefe@${SAMPLE_DOMAIN}`, is_visitor: false },
    { name: 'Lerato Dlamini', phone: '0820000102', email: `lerato.dlamini@${SAMPLE_DOMAIN}`, is_visitor: false },
    { name: 'Sipho Nkosi', phone: '0820000103', email: `sipho.nkosi@${SAMPLE_DOMAIN}`, is_visitor: false },
    { name: 'Nomsa Khumalo', phone: '0820000104', email: `nomsa.khumalo@${SAMPLE_DOMAIN}`, is_visitor: false },
    { name: 'Johan van der Merwe', phone: '0820000202', email: `johan.vdm@${SAMPLE_DOMAIN}`, is_visitor: true },
    { name: 'Amahle Naidoo', phone: '0820000106', email: `amahle.naidoo@${SAMPLE_DOMAIN}`, is_visitor: false },
  ];

  const sundayId = eventIds[0];
  if (sundayId) {
    for (const guest of rsvpNames) {
      const { data: existing } = await db
        .from('event_rsvps')
        .select('id')
        .eq('event_id', sundayId)
        .eq('email', guest.email)
        .maybeSingle();
      if (existing?.id) continue;
      const { error } = await db.from('event_rsvps').insert({
        event_id: sundayId,
        name: guest.name,
        phone: guest.phone,
        email: guest.email,
        status: 'going',
        is_visitor: guest.is_visitor,
        guests_count: guest.is_visitor ? 2 : 1,
        payment_status: 'free',
        ticket_code: `CKC-SAMPLE-${guest.phone.slice(-4)}`,
      });
      if (error) throw new Error(`rsvp ${guest.name}: ${error.message}`);
      summary.push(`rsvp ${guest.name}`);
    }
  }

  const sermons = [
    { title: 'The Power of Grace in Modern Times', preacher: 'Apostle V Mahlaba', preached_at: dateOnly(-7), category: 'Sunday Service', series: 'Grace', duration: '48 min', description: 'A call to live from the finished work of Christ in everyday Midrand life.' },
    { title: 'Building Connection Through Community', preacher: 'Dr T Mahlaba', preached_at: dateOnly(-14), category: 'Sunday Service', series: 'Church Family', duration: '42 min', description: 'Why belonging to a local church is discipleship, not an optional extra.' },
    { title: 'Finding Clarity in the Noise', preacher: 'Apostle V Mahlaba', preached_at: dateOnly(-21), category: 'Sunday Service', series: 'Clarity', duration: '51 min', description: 'Hearing God when work, family, and news compete for attention.' },
    { title: 'Worship as a Lifestyle', preacher: 'Kagiso Mthembu', preached_at: dateOnly(-28), category: 'Sunday Service', series: 'Worship', duration: '39 min', description: 'Worship beyond Sunday — offering our work, homes, and relationships to God.' },
    { title: 'Where is it when God hurts', preacher: 'Apostle V Mahlaba', preached_at: dateOnly(-35), category: 'Bible Study', series: 'God is Love', duration: '44 min', description: 'A word from Psalms on God\'s nearness in pain.' },
    { title: 'Prayer that Moves Heaven', preacher: 'Dr T Mahlaba', preached_at: dateOnly(-10), category: 'Prayer Meeting', series: 'Prayer', duration: '36 min', description: 'Midweek teaching on persistent, Scripture-shaped prayer.' },
  ];

  for (const sermon of sermons) {
    const { data: existing } = await db.from('media_items').select('id').eq('title', sermon.title).limit(1).maybeSingle();
    if (existing?.id) {
      summary.push(`skip sermon ${sermon.title}`);
      continue;
    }
    const { error } = await db.from('media_items').insert({
      campus_id: 'midrand',
      visibility: 'church_wide',
      media_type: 'sermon',
      title: sermon.title,
      preacher: sermon.preacher,
      preached_at: sermon.preached_at,
      category: sermon.category,
      series: sermon.series,
      description: sermon.description,
      duration: sermon.duration,
      youtube_id: null,
      external_url: WATCH_URL,
    });
    if (error) throw new Error(`sermon ${sermon.title}: ${error.message}`);
    summary.push(`sermon ${sermon.title}`);
  }

  const announcements = [
    { title: 'Sunday service times', content: 'Join us this Sunday at 08:30, Midrand campus. Children\'s Church runs during the message. First-time guests, please stop at the welcome table.', category: 'General', pinned: true, visibility: 'church_wide' },
    { title: 'Youth gathering this Friday', content: 'Youth meet Friday at 18:00 in the youth hall. Please RSVP on the Events page so we can plan food.', category: 'Youth', pinned: false, visibility: 'campus_only' },
    { title: 'Outreach Saturday — Glen Austin', content: 'We will prayer-walk the streets around campus. Meet at the sanctuary steps at 09:00. Wear comfortable shoes.', category: 'Outreach', pinned: false, visibility: 'church_wide' },
    { title: 'Membership applications', content: 'If you have been attending and want to become a member, request an invite from the login screen. Pastors review applications each week.', category: 'Ministry', pinned: false, visibility: 'members_only' },
  ];

  for (const item of announcements) {
    const { data: existing } = await db.from('announcements').select('id').eq('title', item.title).limit(1).maybeSingle();
    if (existing?.id) {
      summary.push(`skip announcement ${item.title}`);
      continue;
    }
    const { error } = await db.from('announcements').insert({
      campus_id: 'midrand',
      visibility: item.visibility,
      title: item.title,
      content: item.content,
      category: item.category,
      author_name: 'CKC Midrand',
      pinned: item.pinned,
      status: 'published',
      publish_at: new Date().toISOString(),
      repeat_interval: 'none',
    });
    if (error) throw new Error(`announcement ${item.title}: ${error.message}`);
    summary.push(`announcement ${item.title}`);
  }

  const prayers = [
    { submitter_name: 'Thabo Molefe', contact_email: `thabo.molefe@${SAMPLE_DOMAIN}`, contact_phone: '0820000101', title: 'Healing after surgery', description: 'Please pray for a smooth recovery and peace for my family while I am off work.', category: 'Health', status: 'in_prayer', is_confidential: false, campus_id: 'midrand' },
    { submitter_name: 'Nomsa Khumalo', contact_email: `nomsa.khumalo@${SAMPLE_DOMAIN}`, contact_phone: '0820000104', title: 'Wisdom for our children', description: 'Asking for covering over our home and wisdom as we parent through a difficult school term.', category: 'Family', status: 'assigned', is_confidential: false, campus_id: 'midrand' },
    { submitter_name: 'Kagiso Mthembu', contact_email: `kagiso.mthembu@${SAMPLE_DOMAIN}`, contact_phone: '0820000105', title: 'New job interview', description: 'Interview next week. Pray for favour and a workplace where I can serve with integrity.', category: 'Employment', status: 'new', is_confidential: false, campus_id: 'midrand' },
    { submitter_name: 'Precious Mahlangu', contact_email: `precious.mahlangu@${SAMPLE_DOMAIN}`, contact_phone: '0820000107', title: 'Deeper hunger for the Word', description: 'I want to be more consistent in Scripture and prayer this season.', category: 'Spiritual Growth', status: 'answered', is_confidential: false, campus_id: 'verulam' },
    { submitter_name: 'Lerato Dlamini', contact_email: `lerato.dlamini@${SAMPLE_DOMAIN}`, contact_phone: '0820000102', title: 'Provision this month', description: 'Unexpected car repairs. Trusting God for provision without anxiety.', category: 'Financial', status: 'new', is_confidential: true, campus_id: 'midrand' },
    { submitter_name: 'Sipho Nkosi', contact_email: `sipho.nkosi@${SAMPLE_DOMAIN}`, contact_phone: '0820000103', title: 'Marriage covering', description: 'Please pray for patience and unity as we make decisions about our home.', category: 'Relationships', status: 'in_prayer', is_confidential: true, campus_id: 'midrand' },
  ];

  for (const prayer of prayers) {
    const { data: existing } = await db.from('prayer_requests').select('id').eq('title', prayer.title).eq('contact_email', prayer.contact_email).maybeSingle();
    if (existing?.id) {
      summary.push(`skip prayer ${prayer.title}`);
      continue;
    }
    const { error } = await db.from('prayer_requests').insert({
      ...prayer,
      auto_reply_sent_at: new Date().toISOString(),
    });
    if (error) throw new Error(`prayer ${prayer.title}: ${error.message}`);
    summary.push(`prayer ${prayer.title}`);
  }

  const followUps = [
    { name: 'Johan van der Merwe', phone: '0820000202', campus_id: 'midrand', stage: 'engaging', source: 'Sunday service', notes: 'Sample follow-up — delete from Follow-ups' },
    { name: 'Naledi Mokoena', phone: '0820000205', campus_id: 'midrand', stage: 'committed', source: 'Social media', notes: 'Sample follow-up — delete from Follow-ups' },
    { name: 'David Mabaso', phone: '0820000207', campus_id: 'verulam', stage: 'cold', source: 'Prayer meeting', notes: 'Sample follow-up — delete from Follow-ups' },
    { name: 'Sibusiso Cele', phone: '0820000210', campus_id: 'verulam', stage: 'engaging', source: 'Street outreach', notes: 'Sample follow-up — delete from Follow-ups' },
  ];
  for (const row of followUps) {
    if (await skipIfExists(db, 'follow_ups', 'phone', row.phone)) {
      summary.push(`skip follow-up ${row.name}`);
      continue;
    }
    const { error } = await db.from('follow_ups').insert({
      ...row,
      last_contact_at: iso(-3, 11, 0),
    });
    if (error) throw new Error(`follow_up ${row.name}: ${error.message}`);
    summary.push(`follow-up ${row.name}`);
  }

  const visitors = [
    { name: 'Lerato Dlamini', surname: 'Dlamini', phone: '0820000201', email: `lerato.visitor@${SAMPLE_DOMAIN}`, campus_id: 'midrand', source: 'event_signup', gender: 'Female', marital_status: 'Never Married', accepted_jesus: true, wants_to_join_church: true },
    { name: 'Johan van der Merwe', surname: 'van der Merwe', phone: '0820000202', email: `johan.vdm@${SAMPLE_DOMAIN}`, campus_id: 'midrand', source: 'event_rsvp', gender: 'Male', marital_status: 'Married', accepted_jesus: true, wants_to_join_church: true },
    { name: 'Amahle Naidoo', surname: 'Naidoo', phone: '0820000203', email: `amahle.visitor@${SAMPLE_DOMAIN}`, campus_id: 'midrand', source: 'event_signup', gender: 'Female', marital_status: 'Never Married', accepted_jesus: true, wants_to_join_church: false },
  ];
  for (const row of visitors) {
    if (await skipIfExists(db, 'visitors', 'email', row.email)) {
      summary.push(`skip visitor ${row.name}`);
      continue;
    }
    const { error } = await db.from('visitors').insert({
      ...row,
      event_news_consent: true,
      notes: 'Sample visitor — created the same way as event RSVP / register visitor',
      first_visit_at: iso(-12, 10, 0),
    });
    if (error) throw new Error(`visitor ${row.name}: ${error.message}`);
    summary.push(`visitor ${row.name}`);
  }

  const groups = [
    { name: 'Worship Team', category: 'ministry', campus_id: 'midrand', description: 'Sunday worship, rehearsals, and special gatherings.', leader_phone: '0820000105', leader_name: 'Kagiso Mthembu', enable_song_library: true, members: ['0820000101', '0820000102'] },
    { name: 'Youth Connect', category: 'community', campus_id: 'midrand', description: 'Friday youth and Sunday youth seating.', leader_phone: '0820000106', leader_name: 'Amahle Naidoo', enable_song_library: false, members: ['0820000110'] },
    { name: 'Women of CKC', category: 'community', campus_id: 'midrand', description: 'Prayer, breakfasts, and midweek encouragement.', leader_phone: '0820000109', leader_name: 'Annelise van der Merwe', enable_song_library: false, members: ['0820000102', '0820000104'] },
    { name: 'Men of Valour', category: 'community', campus_id: 'midrand', description: 'Men\'s breakfasts and accountability.', leader_phone: '0820000103', leader_name: 'Sipho Nkosi', enable_song_library: false, members: ['0820000101', '0820000108'] },
    { name: 'Hospitality Team', category: 'ministry', campus_id: 'midrand', description: 'Welcome table, tea, and first-time guests.', leader_phone: '0820000102', leader_name: 'Lerato Dlamini', enable_song_library: false, members: ['0820000104'] },
  ];

  for (const group of groups) {
    const { data: existing } = await db.from('groups').select('id').eq('name', group.name).limit(1).maybeSingle();
    if (existing?.id) {
      summary.push(`skip group ${group.name}`);
      continue;
    }
    const { data, error } = await db
      .from('groups')
      .insert({
        name: group.name,
        category: group.category,
        campus_id: group.campus_id,
        description: group.description,
        leader_phone: group.leader_phone,
        leader_name: group.leader_name,
        enable_song_library: group.enable_song_library,
      })
      .select('id')
      .single();
    if (error) throw new Error(`group ${group.name}: ${error.message}`);
    if (group.members.length) {
      const { error: memberError } = await db.from('group_members').insert(
        group.members.map((phone) => ({
          group_id: data.id,
          member_phone: phone,
          role: 'member',
        })),
      );
      if (memberError) throw new Error(`group members ${group.name}: ${memberError.message}`);
    }
    summary.push(`group ${group.name}`);
  }

  console.log(summary.join('\n'));
  console.log('\nDone. Sample emails use @ckc-sample.test and phones 082 000 0xxx.');
  console.log('Delete later from the matching admin screens (Members, Events, Sermons, Prayer, Groups, Follow-ups).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
