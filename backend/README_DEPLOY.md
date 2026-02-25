# KuralAI Backend Deployment Guide (Render)

This backend is production-ready and configured to run on Render. 
The system features automatic cloud-deployment compatibility including dynamic port binding, 
health checking, and robust startup logic.

### 🚀 Deployment Steps

1. **Commit your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare backend for production"
   git push origin main
   ```

2. **Create a New Web Service in Render**
   - Go to [dashboard.render.com](https://dashboard.render.com/)
   - Click **New +** and select **Web Service**
   - Connect your GitHub repository containing this backend.

3. **Configure the Web Service Settings**
   - **Name:** `kuralai-backend` (or similar)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Set Environment Variables**
   Once you configure the service, scroll down to **Environment Variables** and securely add:
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/kuralai_db` *(Get this from MongoDB Atlas)*
   - `JWT_SECRET`: `your_super_secret_production_key_here`
   - `PORT`: *Render sets this automatically, but you can define it if needed.*

### 🔍 Monitoring the System
When Render boots your server, you can view the logs directly in the Render dashboard. You should expect to see:

```
Initializing category embeddings...
MongoDB Connected: <cluster-address>
Local embedding model (all-MiniLM-L6-v2) loaded successfully.
Category embeddings initialized successfully
Escalation job initialized (Production Ready)
Server is running on port 10000
```

### ✅ System Health Check
Render periodically checks if your server is alive to route traffic or automatically restart it if it crashes.
You can ping your live server at:
`GET https://kuralai-backend.onrender.com/api/health`

It should return:
```json
{
  "status": "OK",
  "uptime": 124.5,
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```

---

*Note on CORS: Currently, `cors({ origin: '*' })` is configured to allow all frontends to connect. Before opening to the public, modify `server.js` to restrict it to your specific frontend URL.*
