# MongoDB Connection Troubleshooting Guide

## Common Connection Errors

### ECONNREFUSED Error
**Error Message:**
```
querySrv ECONNREFUSED _mongodb._tcp.cluster0.znsc1cs.mongodb.net
```

**Possible Causes:**
1. **MongoDB Atlas cluster is paused** - Free tier clusters auto-pause after inactivity
2. **Incorrect connection string** - Verify the URI format and credentials
3. **Network connectivity issues** - Check your internet connection
4. **DNS resolution problems** - Unable to resolve MongoDB hostname
5. **IP whitelist restrictions** - Your IP address is not allowed

**Solutions:**

#### 1. Check MongoDB Atlas Cluster Status
- Log into [MongoDB Atlas](https://cloud.mongodb.com/)
- Navigate to your cluster
- If the cluster shows "Paused", click "Resume" to restart it
- Wait 1-2 minutes for the cluster to fully start

#### 2. Verify Connection String
- Ensure the format is: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
- Verify username and password are correct (no special characters need URL encoding)
- Check that the cluster hostname matches your Atlas cluster

#### 3. Check IP Whitelist
- Go to MongoDB Atlas → Network Access
- Click "Add IP Address"
- For development: Add your current IP or use `0.0.0.0/0` (allows all IPs - **only for development**)
- For production: Add specific IP addresses or IP ranges

#### 4. Test Connection String
You can test your connection string using MongoDB Compass or the MongoDB shell:
```bash
# Using MongoDB Compass
# Download from: https://www.mongodb.com/products/compass
# Paste your connection string and click "Connect"

# Using MongoDB Shell (mongosh)
mongosh "your-connection-string-here"
```

#### 5. Network and Firewall
- Check if your firewall is blocking MongoDB connections (port 27017 or SRV records)
- Verify corporate VPN/proxy settings aren't blocking the connection
- Try connecting from a different network to isolate the issue

## Connection Improvements

The codebase now includes:

1. **Automatic Retry Logic**: 3 retry attempts with exponential backoff
2. **Better Error Messages**: Detailed error information in development mode
3. **Connection State Monitoring**: Tracks connection status and handles reconnections
4. **Graceful Degradation**: API routes return proper error responses instead of crashing

## Connection Configuration

The MongoDB connection is configured in `lib/db.ts` with:
- **Retry attempts**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Connection timeout**: 10 seconds
- **Server selection timeout**: 10 seconds
- **Socket timeout**: 45 seconds
- **Connection pooling**: Up to 10 concurrent connections

## Testing the Connection

To test if your MongoDB connection is working:

1. **Check environment variable**:
   ```bash
   # In your .env.local file
   echo $MONGODB_URI
   ```

2. **Test from Node.js**:
   ```javascript
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('✅ Connected'))
     .catch(err => console.error('❌ Error:', err));
   ```

3. **Check application logs**:
   - Look for "✅ MongoDB connected" message
   - Check for any error messages with connection details

## Production Considerations

For production environments:

1. **Use connection string with specific database name**:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/GoalMania?retryWrites=true&w=majority
   ```

2. **Restrict IP whitelist** to only production server IPs

3. **Monitor connection health** using MongoDB Atlas monitoring

4. **Set up alerts** for connection failures

5. **Use connection pooling** (already configured in `lib/db.ts`)

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Mongoose Connection Options](https://mongoosejs.com/docs/connections.html#options)

