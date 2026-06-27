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
  const clientRes = await request('POST', '/auth/register', { name: "Client Test", email: `c${Date.now()}@example.com`, password: "pass", role: "client" });
  const clientToken = clientRes.data.token;
  const clientId = clientRes.data.user.id;
  
  console.log("Register freelancer...");
  const fRes = await request('POST', '/auth/register', { name: "Freelancer Test", email: `f${Date.now()}@example.com`, password: "pass", role: "freelancer" });
  const fToken = fRes.data.token;
  const fId = fRes.data.user.id;

  console.log("Create project...");
  const projRes = await request('POST', '/projects', { title: "Test Proj", description: "Desc", category: "Web", requiredSkills: [], budgetRange: "10-20", deadline: "2026-05-01", experienceLevel: "Beginner" }, clientToken);
  console.log("Project created:", projRes.status);
  const projId = projRes.data.id;

  console.log("Hire freelancer...");
  const hireRes = await request('POST', `/projects/${projId}/hire`, { freelancerId: fId }, clientToken);
  console.log("Hire status:", hireRes.status);

  console.log("Get chats for client...");
  const chatsRes = await request('GET', '/messages/chats', null, clientToken);
  console.log("Chats res:", JSON.stringify(chatsRes.data, null, 2));

  console.log("Get chats for freelancer...");
  const fChatsRes = await request('GET', '/messages/chats', null, fToken);
  console.log("Freelancer Chats res:", JSON.stringify(fChatsRes.data, null, 2));

  if (chatsRes.data[0]) {
    const chatId = chatsRes.data[0].id;
    console.log("Send message...");
    const msgRes = await request('POST', '/messages', { projectId: projId, text: "Hello!" }, clientToken);
    console.log("Message created:", msgRes.status, msgRes.data);

    console.log("Fetch messages...");
    const msgs = await request('GET', `/messages/${chatId}`, null, fToken);
    console.log("Messages:", JSON.stringify(msgs.data, null, 2));
  }
}

run().catch(console.error);
