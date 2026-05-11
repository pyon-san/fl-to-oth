const JSONBIN_KEY = process.env.JSONBIN_KEY;
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.queryStringParameters?.path || '';
  const url = `${JSONBIN_URL}${path ? '/' + path : ''}`;

  try {
    const fetchHeaders = {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
    };
    if (event.httpMethod === 'PUT') fetchHeaders['X-Bin-Versioning'] = 'false';
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (body._binName) fetchHeaders['X-Bin-Name'] = body._binName;
      if (body._binPrivate === false) fetchHeaders['X-Bin-Private'] = 'false';
    }

    const res = await fetch(url, {
      method: event.httpMethod,
      headers: fetchHeaders,
      body: ['POST', 'PUT'].includes(event.httpMethod) ? event.body : undefined,
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
