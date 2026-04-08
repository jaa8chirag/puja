import db from "./config/db.js";

const setup = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Reviews table created or already exists.");

    const [rows] = await db.query(`SELECT COUNT(*) as count FROM reviews`);
    if (rows[0].count === 0) {
      const sample = [
        { name: "Rahul Verma", date: "Jan 12, 2024", rating: 5, comment: "The pandit ji arrived on time and the puja was conducted with full authenticity. Highly recommend this service.", avatar: "/img/review1.jpg" },
        { name: "Sneha Sharma", date: "Feb 05, 2024", rating: 4, comment: "Very polite pandit ji. The samagri provided was fresh and pure. Made my housewarming completely stress-free.", avatar: "/img/review2.jpg" },
        { name: "Amit Kumar", date: "Mar 18, 2024", rating: 5, comment: "Excellent service! We booked the Navagraha Shanti puja. The entire process was seamless and deeply spiritual.", avatar: "/img/review3.jpg" },
        { name: "Priya Singh", date: "Apr 22, 2024", rating: 5, comment: "Booked for my parents. They were very happy with the traditional approach. Thank you Sri Vedic Puja team.", avatar: "/img/review4.jpg" }
      ];

      for (const r of sample) {
        await db.query(`INSERT INTO reviews (name, date, rating, comment, avatar) VALUES (?, ?, ?, ?, ?)`, [r.name, r.date, r.rating, r.comment, r.avatar]);
      }
      console.log("Seeded initial reviews.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
setup();
