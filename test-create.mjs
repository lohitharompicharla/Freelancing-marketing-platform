import http from 'http';
const request = (method, path, body, token) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api' + path,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, data: JSON.parse(data) }) }
      catch (e) { resolve({ status: res.statusCode, data }) }
    });
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

async function run() {
  console.log("Register client...");
  const clientRes = await request('POST', '/auth/register', { name: "Client Test2", email: `c${Date.now()}@test.com`, password: "pass", role: "client" });
  const clientToken = clientRes.data.token;

  console.log("Create project...");
  const projRes = await request('POST', '/projects', { title: "T", description: "D", category: "Web", requiredSkills: [], budgetRange: "10-20", deadline: "2026-05-01", experienceLevel: "Beginner", fileName: "abc.pdf" }, clientToken);
  console.log("Project created:", projRes.status, projRes.data);
}

run().catch(console.error);
