export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName
        },
        listIds: [parseInt(process.env.BREVO_LIST_ID)],
        updateEnabled: true
      })
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const data = await response.json();
    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    return res.status(400).json({ error: data.message || 'Subscription failed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}