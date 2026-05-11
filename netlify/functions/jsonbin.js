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

    let sendBody = undefined;

    if (event.httpMethod === 'PUT') {
      fetchHeaders['X-Bin-Versioning'] = 'false';
      sendBody = event.body;
    }

    if (event.httpMethod === 'POST') {
      const parsed = JSON.parse(event.body || '{}');
      // 메타 필드 헤더로 분리
      if (parsed._binName) fetchHeaders['X-Bin-Name'] = parsed._binName;
      if (parsed._binPrivate === false) fetchHeaders['X-Bin-Private'] = 'false';
      // 메타 필드 제거한 순수 데이터만 JSONBin에 전송
      const { _binName, _binPrivate, ...cleanBody } = parsed;
      sendBody = JSON.stringify(cleanBody);
    }

    const res = await fetch(url, {
      method: event.httpMethod,
      headers: fetchHeaders,
      body: sendBody,
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
