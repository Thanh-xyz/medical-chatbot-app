// ─── Mock Users ──────────────────────────────────────────────────────────────
export const MOCK_ADMIN = {
    _id: 'admin_001',
    fullName: 'Admin User',
    email: 'admin@medbot.com',
    role: 'admin',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
};

export const MOCK_CLIENTS = [
    {
        _id: 'user_001',
        fullName: 'John Doe',
        email: 'user@medbot.com',
        role: 'client',
        isActive: true,
        createdAt: '2025-03-10T08:00:00.000Z',
    },
    {
        _id: 'user_002',
        fullName: 'Jane Smith',
        email: 'jane@medbot.com',
        role: 'client',
        isActive: true,
        createdAt: '2025-03-15T10:30:00.000Z',
    },
    {
        _id: 'user_003',
        fullName: 'Bob Johnson',
        email: 'bob@medbot.com',
        role: 'client',
        isActive: false,
        createdAt: '2025-04-01T09:00:00.000Z',
    },
];

// ─── Mock Conversations ───────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS = [
    {
        _id: 'conv_001',
        title: 'Headache Consultation',
        user: MOCK_CLIENTS[0],
        messageCount: 6,
        createdAt: '2026-03-28T09:00:00.000Z',
    },
    {
        _id: 'conv_002',
        title: 'Blood Pressure Questions',
        user: MOCK_CLIENTS[0],
        messageCount: 4,
        createdAt: '2026-03-30T14:00:00.000Z',
    },
    {
        _id: 'conv_003',
        title: 'Allergy Symptoms',
        user: MOCK_CLIENTS[1],
        messageCount: 3,
        createdAt: '2026-04-01T11:00:00.000Z',
    },
];

// ─── Mock Messages per conversation ──────────────────────────────────────────
export const MOCK_MESSAGES = {
    conv_001: [
        {
            _id: 'msg_001',
            role: 'user',
            content: "I've been having severe headaches for the past 3 days. What should I do?",
            createdAt: '2026-03-28T09:01:00.000Z',
        },
        {
            _id: 'msg_002',
            role: 'assistant',
            content:
                "I'm sorry to hear you're experiencing headaches. To help better, can you describe the pain? Is it throbbing, pressing, or sharp? And does it affect one or both sides of your head?",
            createdAt: '2026-03-28T09:01:10.000Z',
        },
        {
            _id: 'msg_003',
            role: 'user',
            content: "It's throbbing and mostly on the left side. Sometimes I feel nauseous too.",
            createdAt: '2026-03-28T09:02:00.000Z',
        },
        {
            _id: 'msg_004',
            role: 'assistant',
            content:
                'The symptoms you describe — one-sided throbbing pain with nausea — are characteristic of migraines. Here are some immediate steps:\n\n1. Rest in a quiet, dark room\n2. Stay well hydrated\n3. Apply a cold or warm compress to your forehead\n4. Over-the-counter pain relievers like ibuprofen may help\n\n⚠️ If your headache is the "worst headache of your life," comes with fever/stiff neck, or follows a head injury, please seek emergency care immediately.',
            createdAt: '2026-03-28T09:02:15.000Z',
        },
        {
            _id: 'msg_005',
            role: 'user',
            content: 'How often should I see a doctor for migraines?',
            createdAt: '2026-03-28T09:03:00.000Z',
        },
        {
            _id: 'msg_006',
            role: 'assistant',
            content:
                'If you experience more than **4 migraines per month**, or if they significantly impact your daily life, I recommend seeing a neurologist or your primary care doctor. They can prescribe preventive medications and develop a management plan tailored to you.',
            createdAt: '2026-03-28T09:03:10.000Z',
        },
    ],
    conv_002: [
        {
            _id: 'msg_007',
            role: 'user',
            content: 'My blood pressure reading is 145/95. Is that dangerous?',
            createdAt: '2026-03-30T14:01:00.000Z',
        },
        {
            _id: 'msg_008',
            role: 'assistant',
            content:
                'A reading of 145/95 mmHg falls into the **Stage 2 Hypertension** range (≥140/90). This indicates that your blood pressure is consistently elevated and needs medical attention.\n\nPlease consult your doctor soon. Do not stop or change any current medication without medical advice.',
            createdAt: '2026-03-30T14:01:15.000Z',
        },
        {
            _id: 'msg_009',
            role: 'user',
            content: 'What lifestyle changes can help lower blood pressure?',
            createdAt: '2026-03-30T14:02:00.000Z',
        },
        {
            _id: 'msg_010',
            role: 'assistant',
            content:
                'Effective lifestyle changes include:\n\n🥗 **Diet** — Follow a DASH diet (low sodium, rich in fruits/vegetables)\n🏃 **Exercise** — 30 min of moderate activity most days\n🚭 **Quit smoking** — significantly reduces cardiovascular risk\n🍷 **Limit alcohol** — no more than 1 drink/day for women, 2 for men\n⚖️ **Maintain healthy weight** — even a 5–10 lb loss can help\n😌 **Reduce stress** — meditation, yoga, or breathing exercises',
            createdAt: '2026-03-30T14:02:20.000Z',
        },
    ],
    conv_003: [
        {
            _id: 'msg_011',
            role: 'user',
            content: 'I have runny nose, itchy eyes and sneezing every morning. Could it be allergies?',
            createdAt: '2026-04-01T11:01:00.000Z',
        },
        {
            _id: 'msg_012',
            role: 'assistant',
            content:
                'Yes, those are classic symptoms of **allergic rhinitis** (hay fever). Morning symptoms often suggest sensitivity to indoor allergens like dust mites, or outdoor pollen if windows are open at night.\n\nCommon triggers:\n• Dust mites (most common indoors)\n• Pollen (trees, grass, weeds)\n• Pet dander\n• Mold spores',
            createdAt: '2026-04-01T11:01:12.000Z',
        },
        {
            _id: 'msg_013',
            role: 'user',
            content: 'What medicines can I take?',
            createdAt: '2026-04-01T11:02:00.000Z',
        },
        {
            _id: 'msg_014',
            role: 'assistant',
            content:
                'Over-the-counter options that often help:\n\n💊 **Antihistamines** — Cetirizine (Zyrtec), Loratadine (Claritin) — non-drowsy, once daily\n💊 **Nasal steroids** — Fluticasone (Flonase) — most effective for nasal symptoms\n💊 **Decongestants** — Pseudoephedrine — for short-term congestion relief\n\n⚠️ This is general information only. Please consult a healthcare provider or pharmacist before starting any medication, especially if you have other health conditions.',
            createdAt: '2026-04-01T11:02:15.000Z',
        },
    ],
};
