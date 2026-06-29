/* eslint-disable */
const { Client } = require('pg');
const email = 'molikakhorn71@gmail.com';
const password = 'SECRET_REMOVED';
const METABASE_URL = process.env.METABASE_SITE_URL || 'http://localhost:3002';
const crypto = require('crypto');
const fs = require('fs');

async function main() {
  console.log("=== Metabase Auto-Setup (Idempotent) ===");
  
  console.log("\nAuthenticating with hardcoded credentials...");
  const authRes = await fetch(`${METABASE_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  if (!authRes.ok) {
    console.error("Authentication failed!", await authRes.text());
    return;
  }
  const { id: token } = await authRes.json();
  const headers = {
    'Content-Type': 'application/json',
    'X-Metabase-Session': token,
  };

  async function seedRealisticData() {
    const client = new Client({
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'assessment_dev'
    });

    try {
      await client.connect();
      console.log("Connected to database. Seeding realistic dashboard data...");

      // Get the default client id
      const clientRes = await client.query('SELECT id FROM client LIMIT 1');
      if (clientRes.rows.length === 0) {
        console.log("No client found in DB.");
        return;
      }
      const clientId = clientRes.rows[0].id;

      const ts = Date.now();
      // Insert 5 Topics
      const topicIds = [];
      for(let i=0; i<5; i++) {
        const res = await client.query(`
          INSERT INTO topic (id, "clientId", name, slug, description, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() - (random() * interval '30 days'), NOW())
          RETURNING id
        `, [clientId, `Topic ${i+1} ${ts}`, `topic-${i+1}-${ts}`, `Description for Topic ${i+1}`]);
        topicIds.push(res.rows[0].id);
      }

      // Insert 10 Assessments
      const assessments = [];
      const types = ['QUIZ', 'EXAM', 'SURVEY', 'PRACTICE'];
      for (let i = 0; i < 10; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const res = await client.query(`
          INSERT INTO assessment (id, "clientId", name, type, description, status, "topicId", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PUBLISHED', $5, NOW() - (random() * interval '60 days'), NOW())
          RETURNING id
        `, [clientId, `Real-World Assessment ${i+1} ${ts}`, type, `A comprehensive ${type} test`, topicIds[i % topicIds.length]]);
        assessments.push(res.rows[0].id);
      }

      // Insert 100 Participants
      const participants = [];
      for (let i = 0; i < 100; i++) {
        const res = await client.query(`
          INSERT INTO participant (id, "clientId", name, email, phone, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() - (random() * interval '90 days'), NOW())
          RETURNING id
        `, [clientId, `Student ${i+1}`, `student${i+1}-${ts}@example.com`, `555-01${i.toString().padStart(2, '0')}-${ts}`]);
        participants.push(res.rows[0].id);
      }

      console.log(`Created ${assessments.length} assessments and ${participants.length} participants.`);

      // Insert 400 Answer Sheets over the last 30 days
      let createdCount = 0;
      const usedPairs = new Set();

      for (let i = 0; i < 400; i++) {
        let assessmentId, participantId, pairKey;
        do {
          assessmentId = assessments[Math.floor(Math.random() * assessments.length)];
          participantId = participants[Math.floor(Math.random() * participants.length)];
          pairKey = `${assessmentId}-${participantId}`;
        } while (usedPairs.has(pairKey));
        usedPairs.add(pairKey);
        
        // Create AssessmentParticipant
        const apRes = await client.query(`
          INSERT INTO assessment_participant (id, "clientId", "assessmentId", "participantId", status, "assignedAt", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, 'COMPLETED', NOW() - (random() * interval '30 days'), NOW() - (random() * interval '30 days'), NOW())
          RETURNING id
        `, [clientId, assessmentId, participantId]);
        const apId = apRes.rows[0].id;

        const statuses = ['SUBMITTED', 'GRADED', 'GRADED', 'GRADED', 'REQUIRES_REVIEW'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        let totalScore = null;
        let isPassed = false;
        let grade = null;
        
        if (status === 'GRADED' || status === 'SUBMITTED') {
          totalScore = Math.floor(Math.random() * 101); // 0 to 100
          isPassed = totalScore >= 60;
          if (totalScore >= 90) grade = 'A';
          else if (totalScore >= 80) grade = 'B';
          else if (totalScore >= 70) grade = 'C';
          else if (totalScore >= 60) grade = 'D';
          else grade = 'F';
        }

        // Randomize date over the last 30 days
        const daysAgo = Math.floor(Math.random() * 30);

        await client.query(`
          INSERT INTO answer_sheet (id, "clientId", "assessmentParticipantId", "assessmentId", status, "totalScore", grade, "isPassed", "startedAt", "submittedAt", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 
            NOW() - interval '${daysAgo} days' - interval '1 hour', 
            NOW() - interval '${daysAgo} days', 
            NOW() - interval '${daysAgo} days', 
            NOW() - interval '${daysAgo} days')
        `, [clientId, apId, assessmentId, status, totalScore, grade, isPassed]);
        createdCount++;
      }

      console.log(`Successfully seeded ${createdCount} realistic assessment submissions across the last 30 days!`);
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      await client.end();
    }
  }

  // Run the seeder BEFORE configuring the dashboard
  await seedRealisticData();

  console.log("Fetching databases...");
  const dbRes = await fetch(`${METABASE_URL}/api/database`, { headers });
  const dbs = await dbRes.json();
  const dbList = dbs.data ? dbs.data : dbs;
  const targetDb = dbList.find(d => 
    d.name.toLowerCase().includes('assessment') || 
    d.name.toLowerCase().includes('postgresql') || 
    d.engine === 'postgres'
  );
  
  if (!targetDb) {
    console.error("Could not find the PostgreSQL database in Metabase. Did you connect it?");
    return;
  }
  const dbId = targetDb.id;
  console.log(`Found database: ${targetDb.name} (ID: ${dbId})`);

  console.log("Enabling Instance Embedding...");
  await fetch(`${METABASE_URL}/api/setting/enable-embedding`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ value: true })
  });

  // Check or Create Collection
  console.log("Checking for existing Application Collection...");
  let collectionId = null;
  const colListRes = await fetch(`${METABASE_URL}/api/collection`, { headers });
  const collections = await colListRes.json();
  const existingCol = collections.find(c => c.name === "Assessment Dashboard Assets");
  
  if (existingCol) {
    collectionId = existingCol.id;
    console.log(`Found existing collection (ID: ${collectionId})`);
  } else {
    console.log("Creating new Application Collection...");
    const colRes = await fetch(`${METABASE_URL}/api/collection`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: "Assessment Dashboard Assets", color: "#509EE3" })
    });
    if (colRes.ok) collectionId = (await colRes.json()).id;
  }

  const cardsDefinition = [
    // Top Row (Scalars)
    {
      name: "Total Assessments",
      display: "scalar",
      query: "SELECT COUNT(*) FROM assessment",
      col: 0, row: 0, size_x: 6, size_y: 4
    },
    {
      name: "Total Participants",
      display: "scalar",
      query: "SELECT COUNT(*) FROM participant",
      col: 6, row: 0, size_x: 6, size_y: 4
    },
    {
      name: "Average Score",
      display: "scalar",
      query: "SELECT ROUND(AVG(\"totalScore\"), 1) FROM answer_sheet WHERE \"status\" IN ('SUBMITTED', 'GRADED', 'REQUIRES_REVIEW')",
      col: 12, row: 0, size_x: 6, size_y: 4
    },
    {
      name: "Overall Pass Rate (%)",
      display: "scalar",
      query: "SELECT ROUND(CAST((SUM(CASE WHEN \"isPassed\" = true THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) AS NUMERIC), 1) FROM answer_sheet WHERE \"status\" IN ('SUBMITTED', 'GRADED', 'REQUIRES_REVIEW')",
      col: 18, row: 0, size_x: 6, size_y: 4
    },
    // Middle Row (Charts)
    {
      name: "Submissions by Status",
      display: "pie",
      query: "SELECT \"status\" AS status, COUNT(*) AS count FROM answer_sheet GROUP BY \"status\"",
      col: 0, row: 4, size_x: 8, size_y: 7,
      vis_settings: { "pie.dimension": "status", "pie.measure": "count" }
    },
    {
      name: "Assessments by Type",
      display: "pie",
      query: "SELECT \"type\" AS type, COUNT(*) AS count FROM assessment GROUP BY \"type\"",
      col: 8, row: 4, size_x: 8, size_y: 7,
      vis_settings: { "pie.dimension": "type", "pie.measure": "count" }
    },
    {
      name: "Score Distribution",
      display: "bar",
      query: "SELECT \"totalScore\" AS score, COUNT(*) AS count FROM answer_sheet WHERE \"status\" IN ('SUBMITTED', 'GRADED', 'REQUIRES_REVIEW') AND \"totalScore\" IS NOT NULL GROUP BY \"totalScore\" ORDER BY \"totalScore\" ASC",
      col: 16, row: 4, size_x: 8, size_y: 7,
      vis_settings: { "graph.dimensions": ["score"], "graph.metrics": ["count"] }
    },
    // Bottom Row (Table)
    {
      name: "Recent Submissions",
      display: "table",
      query: "SELECT p.name AS \"Participant\", a.name AS \"Assessment\", ans.\"status\" AS \"Status\", ans.grade AS \"Grade\", ans.\"totalScore\" AS \"Score\", DATE(ans.\"createdAt\") AS \"Date\" FROM answer_sheet ans JOIN assessment_participant ap ON ans.\"assessmentParticipantId\" = ap.id JOIN participant p ON ap.\"participantId\" = p.id JOIN assessment a ON ans.\"assessmentId\" = a.id ORDER BY ans.\"createdAt\" DESC LIMIT 10",
      col: 0, row: 11, size_x: 24, size_y: 8
    }
  ];

  console.log("Fetching existing charts...");
  const cardsGetRes = await fetch(`${METABASE_URL}/api/card`, { headers });
  const allCards = await cardsGetRes.json();

  const finalCards = [];
  console.log("Setting up charts...");
  for (const cardDef of cardsDefinition) {
    const existingCard = allCards.find(c => c.name === cardDef.name && c.collection_id === collectionId);
    let cardId;
    
    if (existingCard) {
      console.log(`Updating existing chart: ${cardDef.name}`);
      await fetch(`${METABASE_URL}/api/card/${existingCard.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          display: cardDef.display,
          dataset_query: {
            database: dbId,
            type: "native",
            native: { query: cardDef.query }
          },
          visualization_settings: cardDef.vis_settings || {}
        })
      });
      cardId = existingCard.id;
    } else {
      console.log(`Creating chart: ${cardDef.name}`);
      const res = await fetch(`${METABASE_URL}/api/card`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: cardDef.name,
          display: cardDef.display,
          dataset_query: {
            database: dbId,
            type: "native",
            native: { query: cardDef.query }
          },
          collection_id: collectionId,
          visualization_settings: cardDef.vis_settings || {}
        })
      });
      if (res.ok) {
        cardId = (await res.json()).id;
      }
    }
    
    if (cardId) {
      finalCards.push({ ...cardDef, id: cardId });
    }
  }

  console.log("Checking for existing Dashboard...");
  const dashListRes = await fetch(`${METABASE_URL}/api/dashboard`, { headers });
  const dashboards = await dashListRes.json();
  const existingDash = dashboards.find(d => d.name === "Assessment Overview");

  let dashboardId = null;
  if (existingDash) {
    console.log(`Found existing dashboard (ID: ${existingDash.id})`);
    dashboardId = existingDash.id;
  } else {
    console.log("Creating new Dashboard...");
    const dashRes = await fetch(`${METABASE_URL}/api/dashboard`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: "Assessment Overview",
        description: "Auto-generated dashboard for Assessment Service",
        collection_id: collectionId
      })
    });
    if (dashRes.ok) {
      dashboardId = (await dashRes.json()).id;
    }
  }

  if (!dashboardId) {
    console.error("Failed to setup dashboard!");
    return;
  }

  console.log("Adding/Updating charts on dashboard layout...");
  const dashcards = finalCards.map((card, index) => ({
    id: -(index + 1), // -1, -2 etc replaces/adds them as new layout items
    card_id: card.id,
    row: card.row,
    col: card.col,
    size_x: card.size_x,
    size_y: card.size_y,
    parameter_mappings: []
  }));

  const addCardsRes = await fetch(`${METABASE_URL}/api/dashboard/${dashboardId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ dashcards })
  });
  if (!addCardsRes.ok) console.error("Failed to update dashboard cards", await addCardsRes.text());

  console.log("Enabling Dashboard Embedding...");
  await fetch(`${METABASE_URL}/api/dashboard/${dashboardId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ enable_embedding: true })
  });

  console.log("\n✅ Dashboard successfully configured!");
  console.log("=======================================================");
  console.log(`🎉 DASHBOARD ID IS: ${dashboardId}`);
  console.log("=======================================================\n");

  // Read and update .env if needed
  try {
    const envPath = require('path').join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('METABASE_DASHBOARD_ID=')) {
      envContent = envContent.replace(/METABASE_DASHBOARD_ID="?\d+"?/, `METABASE_DASHBOARD_ID="${dashboardId}"`);
    } else {
      envContent += `\nMETABASE_DASHBOARD_ID="${dashboardId}"\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env file with the Dashboard ID automatically!");
  } catch {
    console.log("Could not update .env file automatically. Please ensure METABASE_DASHBOARD_ID is set.");
  }
}

main().catch(console.error);
