# Metabase Integration Setup

The dashboard of the Assessment Service is powered by **Metabase**, an open-source business intelligence server. It allows you to create drag-and-drop charts using your PostgreSQL data, which we then securely embed directly inside our Next.js frontend!

Follow these steps to set up Metabase on your local machine.

## 1. Start Metabase using Docker

Since your Next.js application runs on port `3000` by default, we will run Metabase on port `3002` to avoid conflicts.

Open a new terminal and run:

```bash
docker run -d -p 3002:3000 --name metabase metabase/metabase
```

> [!TIP]
> This will download and start the Metabase server in the background. It may take 1-2 minutes for Metabase to fully initialize on the first boot.

## 2. Connect Metabase to your Database

1. Open your browser and navigate to [http://localhost:3002](http://localhost:3002)
2. Follow the setup wizard to create an admin account.
3. When prompted to add a database, select **PostgreSQL**.
4. Enter your connection details (you can find these in the `assessment-service-backend/.env` file under `DATABASE_URL`).
   - Host: `host.docker.internal` (if you are on Mac/Windows) or `localhost`
   - Port: `5432`
   - Database Name, Username, and Password as defined in your backend setup.

## 3. Enable Embedding and get your Secret Key

1. Once inside Metabase, go to **Settings (Gear Icon) > Admin settings**.
2. On the left sidebar, click **Embedding**.
3. Click **Enable embedding**.
4. Metabase will generate an **Embedding Secret Key**. Copy this key!

## 4. Create your first Dashboard

1. Exit the Admin settings and go back to the main Metabase screen.
2. Click **+ New > Dashboard** and name it "Assessment Overview".
3. Add some questions (charts) to your dashboard. For example, a pie chart showing pass rates!
4. Save the dashboard.
5. Click the **Sharing icon (arrow pointing right)** in the top right corner of your dashboard.
6. Select **Embed this dashboard in an application**.
7. Click **Publish**.

## 5. Configure Next.js

Finally, we need to tell your Next.js frontend where Metabase is and what the secret key is.

Open your `assessment-service/.env` file and add the following lines:

```env
# Metabase Configuration
METABASE_SITE_URL="http://localhost:3002"
METABASE_SECRET_KEY="<paste-your-secret-key-here>"
METABASE_DASHBOARD_ID="1" # Change this if your dashboard ID in Metabase is different
```

Restart your Next.js frontend (`pnpm run dev`). When you go to the **Dashboard** tab in your app, you will now see your fully interactive Metabase charts!
