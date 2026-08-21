require("dotenv").config();
const { pool } = require("./config/db");

async function seedAuctions() {
  console.log("🌱 Starting Comprehensive Auction Seeding...\n");

  try {
    // 1. Fetch all users from DB
    const usersResult = await pool.query("SELECT id, name, email, role FROM users ORDER BY id ASC");
    const users = usersResult.rows;

    console.log(`👥 Found ${users.length} users in database:`);
    users.forEach(u => console.log(`   - ID ${u.id}: ${u.name} (${u.role})`));

    // Map specific users by ID
    const uAaditya = users.find(u => u.id === 2) || users[0];
    const uJoginder = users.find(u => u.id === 3) || users[1];
    const uKirt = users.find(u => u.id === 4) || users[2];
    const uAyo = users.find(u => u.id === 5) || users[3];
    const uDemo = users.find(u => u.id === 6) || users[4];
    const uBansal = users.find(u => u.id === 7) || users[5];
    const uAbhay = users.find(u => u.id === 8) || users[6];
    const uKaran = users.find(u => u.id === 9) || users[7];

    // Clear old sample RFQs to maintain clean state
    console.log("\n🧹 Cleaning old seed data...");
    await pool.query("DELETE FROM messages");
    await pool.query("DELETE FROM rfq_audit");
    await pool.query("DELETE FROM bids");
    await pool.query("DELETE FROM rfq");
    console.log("✨ Cleaned existing auction records.");

    // Get current DB server time
    const nowResult = await pool.query("SELECT NOW() as current_time");
    const now = new Date(nowResult.rows[0].current_time);
    console.log(`🕒 Server Time: ${now.toISOString()}\n`);

    // =========================================================================
    // FIELD 1: Freight & Logistics (Category 1)
    // AUCTION 1: ANY_BID Trigger (ACTIVE, 6 Bids, 3 Extensions)
    // =========================================================================
    console.log("📌 Seeding Auction 1 [Freight & Logistics]: 'Ocean Freight Shipping: 50 Cargo Containers' (ANY_BID, Active)...");

    const start1 = new Date(now.getTime() - 30 * 60000);
    const origClose1 = new Date(now.getTime() + 15 * 60000);
    const ext1_Close1 = new Date(now.getTime() + 20 * 60000);
    const ext1_Close2 = new Date(now.getTime() + 25 * 60000);
    const ext1_Close3 = new Date(now.getTime() + 30 * 60000);
    const forceClose1 = new Date(now.getTime() + 120 * 60000);

    const rfq1Res = await pool.query(
      `INSERT INTO rfq (name, description, category_id, created_by, bid_start_time, bid_close_time, forced_close_time, service_date, trigger_window, extension_duration, trigger_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        "Ocean Freight Shipping: 50 Cargo Containers (Mumbai to Hamburg)",
        "International ocean freight procurement for 50 TEU dry containers from Jawaharlal Nehru Port (JNPT), Mumbai to Hamburg Port, Germany. Includes origin documentation and destination customs clearance.",
        1, // Freight & Logistics
        uAaditya.id,
        start1,
        ext1_Close3, // Final extended close time
        forceClose1,
        "2026-08-01",
        15, // 15 min window
        5,  // 5 min duration
        "ANY_BID",
        start1
      ]
    );
    const rfq1 = rfq1Res.rows[0];

    // 6 Bids for Auction 1 (Carrier Name = User Name)
    const t1_b1 = new Date(now.getTime() - 25 * 60000);
    const t1_b2 = new Date(now.getTime() - 20 * 60000);
    const t1_b3 = new Date(now.getTime() - 12 * 60000); // Triggers Ext 1
    const t1_b4 = new Date(now.getTime() - 8 * 60000);  // Triggers Ext 2
    const t1_b5 = new Date(now.getTime() - 4 * 60000);  // Triggers Ext 3
    const t1_b6 = new Date(now.getTime() - 1 * 60000);

    const bids1 = [
      { user: uJoginder, amount: 4800000, freight: 4200000, origin: 300000, dest: 300000, transit: "14 days", validity: "30 days", time: t1_b1 },
      { user: uKirt,     amount: 4500000, freight: 4000000, origin: 250000, dest: 250000, transit: "13 days", validity: "30 days", time: t1_b2 },
      { user: uAyo,      amount: 4300000, freight: 3900000, origin: 200000, dest: 200000, transit: "12 days", validity: "20 days", time: t1_b3 },
      { user: uBansal,   amount: 4600000, freight: 4100000, origin: 250000, dest: 250000, transit: "14 days", validity: "30 days", time: t1_b4 },
      { user: uAbhay,    amount: 4100000, freight: 3700000, origin: 200000, dest: 200000, transit: "11 days", validity: "15 days", time: t1_b5 },
      { user: uKaran,    amount: 3950000, freight: 3550000, origin: 200000, dest: 200000, transit: "10 days", validity: "15 days", time: t1_b6 }
    ];

    for (const b of bids1) {
      await pool.query(
        `INSERT INTO bids (rfq_id, user_id, bid_amount, carrier_name, freight_charges, origin_charges, destination_charges, transit_time, validity, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [rfq1.id, b.user.id, b.amount, b.user.name, b.freight, b.origin, b.dest, b.transit, b.validity, b.time]
      );
    }

    // Exact Audit Activity Logs for Auction 1
    const audit1 = [
      { action: `Bid placed: ₹4800000 by ${uJoginder.name} (New L1)`, oldC: null, newC: null, by: uJoginder.name, at: t1_b1 },
      { action: `Bid placed: ₹4500000 by ${uKirt.name} (New L1)`, oldC: null, newC: null, by: uKirt.name, at: t1_b2 },
      { action: `Bid placed: ₹4300000 by ${uAyo.name} (New L1)`, oldC: null, newC: null, by: uAyo.name, at: t1_b3 },
      { action: `Bid received in last 15 minutes`, oldC: origClose1, newC: ext1_Close1, by: "system", at: t1_b3 },
      { action: `Bid placed: ₹4600000 by ${uBansal.name}`, oldC: null, newC: null, by: uBansal.name, at: t1_b4 },
      { action: `Bid received in last 15 minutes`, oldC: ext1_Close1, newC: ext1_Close2, by: "system", at: t1_b4 },
      { action: `Bid placed: ₹4100000 by ${uAbhay.name} (New L1)`, oldC: null, newC: null, by: uAbhay.name, at: t1_b5 },
      { action: `Bid received in last 15 minutes`, oldC: ext1_Close2, newC: ext1_Close3, by: "system", at: t1_b5 },
      { action: `Bid placed: ₹3950000 by ${uKaran.name} (New L1)`, oldC: null, newC: null, by: uKaran.name, at: t1_b6 }
    ];

    for (const a of audit1) {
      await pool.query(
        `INSERT INTO rfq_audit (rfq_id, action, old_bid_close_time, new_bid_close_time, changed_by, changed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rfq1.id, a.action, a.oldC, a.newC, a.by, a.at]
      );
    }
    console.log(`✅ Auction 1 created (ID: ${rfq1.id}) — Freight & Logistics, 6 Bids, 3 Extensions.\n`);

    // =========================================================================
    // FIELD 2: IT & Software (Category 2)
    // AUCTION 2: ANY_RANK_CHANGE Trigger (ACTIVE, 5 Bids, 2 Extensions)
    // =========================================================================
    console.log("📌 Seeding Auction 2 [IT & Software]: 'Enterprise Cloud Infrastructure Migration to AWS' (ANY_RANK_CHANGE, Active)...");

    const start2 = new Date(now.getTime() - 40 * 60000);
    const origClose2 = new Date(now.getTime() + 10 * 60000);
    const ext2_Close1 = new Date(now.getTime() + 15 * 60000);
    const ext2_Close2 = new Date(now.getTime() + 20 * 60000);
    const forceClose2 = new Date(now.getTime() + 90 * 60000);

    const rfq2Res = await pool.query(
      `INSERT INTO rfq (name, description, category_id, created_by, bid_start_time, bid_close_time, forced_close_time, service_date, trigger_window, extension_duration, trigger_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        "Enterprise Cloud Infrastructure Migration to AWS",
        "Migrating 45 on-premise virtual machines, PostgreSQL databases, and microservices to AWS EC2 and RDS with zero downtime. Requires DevOps expertise in Docker, Terraform, and Caddy reverse proxies.",
        2, // IT & Software
        uDemo.id,
        start2,
        ext2_Close2,
        forceClose2,
        "2026-08-15",
        10, // 10 min window
        5,  // 5 min duration
        "ANY_RANK_CHANGE",
        start2
      ]
    );
    const rfq2 = rfq2Res.rows[0];

    // 5 Bids for Auction 2
    const t2_b1 = new Date(now.getTime() - 35 * 60000);
    const t2_b2 = new Date(now.getTime() - 25 * 60000);
    const t2_b3 = new Date(now.getTime() - 15 * 60000);
    const t2_b4 = new Date(now.getTime() - 7 * 60000);  // Triggers Ext 1
    const t2_b5 = new Date(now.getTime() - 2 * 60000);  // Triggers Ext 2

    const bids2 = [
      { user: uJoginder, amount: 900000, freight: 0, origin: 480000, dest: 420000, transit: "4 weeks", validity: "30 days", time: t2_b1 },
      { user: uKirt,     amount: 820000, freight: 0, origin: 430000, dest: 390000, transit: "3 weeks", validity: "30 days", time: t2_b2 },
      { user: uAyo,      amount: 760000, freight: 0, origin: 400000, dest: 360000, transit: "2 weeks", validity: "30 days", time: t2_b3 },
      { user: uAbhay,    amount: 710000, freight: 0, origin: 370000, dest: 340000, transit: "12 days", validity: "15 days", time: t2_b4 },
      { user: uKaran,    amount: 680000, freight: 0, origin: 350000, dest: 330000, transit: "10 days", validity: "15 days", time: t2_b5 }
    ];

    for (const b of bids2) {
      await pool.query(
        `INSERT INTO bids (rfq_id, user_id, bid_amount, carrier_name, freight_charges, origin_charges, destination_charges, transit_time, validity, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [rfq2.id, b.user.id, b.amount, b.user.name, b.freight, b.origin, b.dest, b.transit, b.validity, b.time]
      );
    }

    // Exact Audit Activity Logs for Auction 2
    const audit2 = [
      { action: `Bid placed: ₹900000 by ${uJoginder.name} (New L1)`, oldC: null, newC: null, by: uJoginder.name, at: t2_b1 },
      { action: `Bid placed: ₹820000 by ${uKirt.name} (New L1)`, oldC: null, newC: null, by: uKirt.name, at: t2_b2 },
      { action: `Bid placed: ₹760000 by ${uAyo.name} (New L1)`, oldC: null, newC: null, by: uAyo.name, at: t2_b3 },
      { action: `Bid placed: ₹710000 by ${uAbhay.name} (New L1)`, oldC: null, newC: null, by: uAbhay.name, at: t2_b4 },
      { action: `Supplier rank change in last 10 minutes`, oldC: origClose2, newC: ext2_Close1, by: "system", at: t2_b4 },
      { action: `Bid placed: ₹680000 by ${uKaran.name} (New L1)`, oldC: null, newC: null, by: uKaran.name, at: t2_b5 },
      { action: `Supplier rank change in last 10 minutes`, oldC: ext2_Close1, newC: ext2_Close2, by: "system", at: t2_b5 }
    ];

    for (const a of audit2) {
      await pool.query(
        `INSERT INTO rfq_audit (rfq_id, action, old_bid_close_time, new_bid_close_time, changed_by, changed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rfq2.id, a.action, a.oldC, a.newC, a.by, a.at]
      );
    }
    console.log(`✅ Auction 2 created (ID: ${rfq2.id}) — IT & Software, 5 Bids, 2 Extensions.\n`);

    // =========================================================================
    // FIELD 3: Catering & Hospitality (Category 7)
    // AUCTION 3: L1_CHANGE Trigger (CLOSED / COMPLETED, 6 Bids, 2 Extensions, Negotiation Chat)
    // =========================================================================
    console.log("📌 Seeding Auction 3 [Catering]: 'Corporate Annual Gala Catering & Beverage Service (500 Guests)' (L1_CHANGE, Closed)...");

    const start3 = new Date(now.getTime() - 60 * 60000);
    const origClose3 = new Date(now.getTime() - 20 * 60000);
    const ext3_Close1 = new Date(now.getTime() - 15 * 60000);
    const close3 = new Date(now.getTime() - 10 * 60000); // Closed 10 mins ago!
    const forceClose3 = new Date(now.getTime() - 2 * 60000);

    const rfq3Res = await pool.query(
      `INSERT INTO rfq (name, description, category_id, created_by, bid_start_time, bid_close_time, forced_close_time, service_date, trigger_window, extension_duration, trigger_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        "Corporate Annual Gala Catering & Beverage Service (500 Guests)",
        "Full-service premium 5-course banquet catering, live mocktail stations, dessert counters, and professional waiting staff for a 500-guest corporate anniversary event.",
        7, // Catering
        uAaditya.id, // Poster is Aaditya Kumar
        start3,
        close3,
        forceClose3,
        "2026-08-20",
        10, // 10 min window
        5,  // 5 min duration
        "L1_CHANGE",
        start3
      ]
    );
    const rfq3 = rfq3Res.rows[0];

    // 6 Bids for Auction 3 (Winning L1 is uKaran)
    const t3_b1 = new Date(now.getTime() - 50 * 60000);
    const t3_b2 = new Date(now.getTime() - 40 * 60000);
    const t3_b3 = new Date(now.getTime() - 30 * 60000);
    const t3_b4 = new Date(now.getTime() - 18 * 60000); // Triggers Ext 1
    const t3_b5 = new Date(now.getTime() - 13 * 60000); // Triggers Ext 2
    const t3_b6 = new Date(now.getTime() - 11 * 60000); // Final winning L1 bid

    const bids3 = [
      { user: uJoginder, amount: 350000, freight: 0, origin: 180000, dest: 170000, transit: "1 day", validity: "30 days", time: t3_b1 },
      { user: uKirt,     amount: 320000, freight: 0, origin: 165000, dest: 155000, transit: "1 day", validity: "30 days", time: t3_b2 },
      { user: uAyo,      amount: 295000, freight: 0, origin: 150000, dest: 145000, transit: "1 day", validity: "30 days", time: t3_b3 },
      { user: uBansal,   amount: 275000, freight: 0, origin: 140000, dest: 135000, transit: "1 day", validity: "20 days", time: t3_b4 },
      { user: uAbhay,    amount: 250000, freight: 0, origin: 130000, dest: 120000, transit: "1 day", validity: "15 days", time: t3_b5 },
      { user: uKaran,    amount: 235000, freight: 0, origin: 120000, dest: 115000, transit: "1 day", validity: "15 days", time: t3_b6 } // Winner!
    ];

    for (const b of bids3) {
      await pool.query(
        `INSERT INTO bids (rfq_id, user_id, bid_amount, carrier_name, freight_charges, origin_charges, destination_charges, transit_time, validity, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [rfq3.id, b.user.id, b.amount, b.user.name, b.freight, b.origin, b.dest, b.transit, b.validity, b.time]
      );
    }

    // Exact Audit Activity Logs for Auction 3
    const audit3 = [
      { action: `Bid placed: ₹350000 by ${uJoginder.name} (New L1)`, oldC: null, newC: null, by: uJoginder.name, at: t3_b1 },
      { action: `Bid placed: ₹320000 by ${uKirt.name} (New L1)`, oldC: null, newC: null, by: uKirt.name, at: t3_b2 },
      { action: `Bid placed: ₹295000 by ${uAyo.name} (New L1)`, oldC: null, newC: null, by: uAyo.name, at: t3_b3 },
      { action: `Bid placed: ₹275000 by ${uBansal.name} (New L1)`, oldC: null, newC: null, by: uBansal.name, at: t3_b4 },
      { action: `L1 (lowest bidder) changed in last 10 minutes`, oldC: origClose3, newC: ext3_Close1, by: "system", at: t3_b4 },
      { action: `Bid placed: ₹250000 by ${uAbhay.name} (New L1)`, oldC: null, newC: null, by: uAbhay.name, at: t3_b5 },
      { action: `L1 (lowest bidder) changed in last 10 minutes`, oldC: ext3_Close1, newC: close3, by: "system", at: t3_b5 },
      { action: `Bid placed: ₹235000 by ${uKaran.name} (New L1)`, oldC: null, newC: null, by: uKaran.name, at: t3_b6 }
    ];

    for (const a of audit3) {
      await pool.query(
        `INSERT INTO rfq_audit (rfq_id, action, old_bid_close_time, new_bid_close_time, changed_by, changed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rfq3.id, a.action, a.oldC, a.newC, a.by, a.at]
      );
    }

    // Seed Active Post-Auction Negotiation Chat between Poster (uAaditya) & Winner (uKaran)
    console.log(`💬 Seeding post-auction negotiation chat for Completed Auction ${rfq3.id}...`);

    const msg1 = new Date(now.getTime() - 8 * 60000);
    const msg2 = new Date(now.getTime() - 5 * 60000);
    const msg3 = new Date(now.getTime() - 2 * 60000);

    await pool.query(
      `INSERT INTO messages (rfq_id, sender_id, receiver_id, content, is_read, created_at)
       VALUES 
       ($1, $2, $3, $4, TRUE, $5),
       ($1, $3, $2, $6, TRUE, $7),
       ($1, $2, $3, $8, FALSE, $9)`,
      [
        rfq3.id,
        uKaran.id, // Sender: Winner
        uAaditya.id, // Receiver: Poster
        `Hi ${uAaditya.name}! We won the L1 bid (₹235,000) for the corporate gala catering. When can we discuss menu customizations and venue setup?`,
        msg1,
        `Hi ${uKaran.name}, excellent bid! Let's schedule a call tomorrow at 11 AM to finalize the course menu and dietary options.`,
        msg2,
        `Sounds great! I will share the menu brochure and join the meeting tomorrow at 11 AM. Thank you!`,
        msg3
      ]
    );

    console.log(`✅ Auction 3 created (ID: ${rfq3.id}) — Catering, CLOSED/COMPLETED, 6 Bids, 2 Extensions, Live Chat Active!\n`);

    console.log("🎉 All 3 distinct field auctions seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`1. [ID: ${rfq1.id}] ${rfq1.name} → ACTIVE (Field: Freight & Logistics, Trigger: ANY_BID, 6 Bids, 3 Extensions)`);
    console.log(`2. [ID: ${rfq2.id}] ${rfq2.name} → ACTIVE (Field: IT & Software, Trigger: ANY_RANK_CHANGE, 5 Bids, 2 Extensions)`);
    console.log(`3. [ID: ${rfq3.id}] ${rfq3.name} → CLOSED (Field: Catering, Trigger: L1_CHANGE, Winner: ${uKaran.name}, 6 Bids, 2 Extensions, Chat Live!)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("❌ Error seeding auctions:", err);
  } finally {
    await pool.end();
  }
}

seedAuctions();
