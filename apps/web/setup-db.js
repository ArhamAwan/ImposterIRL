import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  console.log('Setting up database tables...');

  try {
    // Create lobbies table
    await sql`
      CREATE TABLE IF NOT EXISTS lobbies (
        code VARCHAR(6) PRIMARY KEY,
        host_player_id VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        category VARCHAR(100),
        round_duration INTEGER DEFAULT 300,
        total_rounds INTEGER DEFAULT 3,
        current_round INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created lobbies table');

    // Create players table
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(255) PRIMARY KEY,
        lobby_code VARCHAR(6) REFERENCES lobbies(code) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        avatar_color VARCHAR(20),
        is_host BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created players table');

    // Create scores table
    await sql`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        lobby_code VARCHAR(6) REFERENCES lobbies(code) ON DELETE CASCADE,
        player_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
        points INTEGER DEFAULT 0
      )
    `;
    console.log('✓ Created scores table');

    // Create word categories table
    await sql`
      CREATE TABLE IF NOT EXISTS word_categories (
        category VARCHAR(100) PRIMARY KEY,
        words TEXT[] NOT NULL
      )
    `;
    console.log('✓ Created word_categories table');

    // Create game rounds table
    await sql`
      CREATE TABLE IF NOT EXISTS game_rounds (
        id SERIAL PRIMARY KEY,
        lobby_code VARCHAR(6) REFERENCES lobbies(code) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        imposter_id VARCHAR(255),
        word VARCHAR(100),
        category VARCHAR(100),
        phase VARCHAR(20) DEFAULT 'word_reveal',
        round_start_time TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created game_rounds table');

    // Create game history table for leaderboard
    await sql`
      CREATE TABLE IF NOT EXISTS game_history (
        id SERIAL PRIMARY KEY,
        lobby_code VARCHAR(6),
        player_id VARCHAR(255),
        player_name VARCHAR(100) NOT NULL,
        opponent_name VARCHAR(100) NOT NULL,
        won BOOLEAN DEFAULT FALSE,
        was_imposter BOOLEAN DEFAULT FALSE,
        caught_as_imposter BOOLEAN DEFAULT FALSE,
        survived_as_imposter BOOLEAN DEFAULT FALSE,
        played_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created game_history table');

    // Create index on player_name for faster leaderboard queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_game_history_player_name 
      ON game_history(player_name)
    `;
    console.log('✓ Created game_history index');

    // Insert default categories
    const categories = [
      { name: 'Animals', words: ['Dog', 'Cat', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Eagle', 'Shark', 'Dolphin', 'Penguin', 'Giraffe', 'Zebra', 'Monkey', 'Snake', 'Rabbit'] },
      { name: 'Food', words: ['Pizza', 'Burger', 'Sushi', 'Pasta', 'Tacos', 'Ice Cream', 'Chocolate', 'Salad', 'Steak', 'Sandwich', 'Soup', 'Cake', 'Cookies', 'Apple', 'Banana'] },
      { name: 'Movies', words: ['Titanic', 'Avatar', 'Inception', 'Frozen', 'Jaws', 'Matrix', 'Gladiator', 'Joker', 'Parasite', 'Shrek', 'Up', 'Coco', 'Moana', 'Deadpool', 'Interstellar'] },
      { name: 'Sports', words: ['Soccer', 'Basketball', 'Tennis', 'Golf', 'Swimming', 'Boxing', 'Cricket', 'Rugby', 'Hockey', 'Baseball', 'Volleyball', 'Skiing', 'Surfing', 'Cycling', 'Running'] }
    ];

    for (const cat of categories) {
      await sql`
        INSERT INTO word_categories (category, words)
        VALUES (${cat.name}, ${cat.words})
        ON CONFLICT (category) DO NOTHING
      `;
    }
    console.log('✓ Inserted default word categories');

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();

