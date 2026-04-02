// ─── Sport Configuration ─────────────────────────────────────────────────────
// Static config defining what stats/positions/attributes each sport tracks.
// NOT a database model — just constants.

export interface StatField {
  key: string;
  label: string;
  type: 'number' | 'time' | 'distance' | 'select' | 'boolean';
  unit?: string;
  options?: string[];
}

export interface SportCodeConfig {
  code: string;
  name: string;
  positions: string[];
  ratingAttributes: string[]; // 6 attributes for radar chart
  playerStatFields: StatField[];
  teamStatFields: StatField[];
}

export const SPORT_CONFIGS: Record<string, SportCodeConfig> = {
  cricket: {
    code: 'cricket',
    name: 'Cricket',
    positions: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    ratingAttributes: ['Batting', 'Bowling', 'Fielding', 'Fitness', 'Consistency', 'Impact'],
    playerStatFields: [
      { key: 'runs', label: 'Runs', type: 'number' },
      { key: 'ballsFaced', label: 'Balls Faced', type: 'number' },
      { key: 'fours', label: 'Fours', type: 'number' },
      { key: 'sixes', label: 'Sixes', type: 'number' },
      { key: 'howOut', label: 'How Out', type: 'select', options: ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket', 'not_out', 'retired'] },
      { key: 'overs', label: 'Overs Bowled', type: 'number' },
      { key: 'maidens', label: 'Maidens', type: 'number' },
      { key: 'runsConceded', label: 'Runs Conceded', type: 'number' },
      { key: 'wickets', label: 'Wickets', type: 'number' },
      { key: 'catches', label: 'Catches', type: 'number' },
      { key: 'runOuts', label: 'Run Outs', type: 'number' },
      { key: 'stumpings', label: 'Stumpings', type: 'number' },
    ],
    teamStatFields: [
      { key: 'totalRuns', label: 'Total Runs', type: 'number' },
      { key: 'totalWickets', label: 'Wickets Lost', type: 'number' },
      { key: 'overs', label: 'Overs', type: 'number' },
      { key: 'extras', label: 'Extras', type: 'number' },
    ],
  },
  rugby: {
    code: 'rugby',
    name: 'Rugby',
    positions: ['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 'Scrumhalf', 'Flyhalf', 'Centre', 'Wing', 'Fullback'],
    ratingAttributes: ['Attack', 'Defence', 'Kicking', 'Strength', 'Speed', 'Game Sense'],
    playerStatFields: [
      { key: 'tries', label: 'Tries', type: 'number' },
      { key: 'conversions', label: 'Conversions', type: 'number' },
      { key: 'penalties', label: 'Penalty Goals', type: 'number' },
      { key: 'dropGoals', label: 'Drop Goals', type: 'number' },
      { key: 'tackles', label: 'Tackles Made', type: 'number' },
      { key: 'tacklesMissed', label: 'Tackles Missed', type: 'number' },
      { key: 'carries', label: 'Carries', type: 'number' },
      { key: 'metresGained', label: 'Metres Gained', type: 'number' },
      { key: 'turnovers', label: 'Turnovers Won', type: 'number' },
      { key: 'yellowCards', label: 'Yellow Cards', type: 'number' },
      { key: 'redCards', label: 'Red Cards', type: 'number' },
    ],
    teamStatFields: [
      { key: 'totalPoints', label: 'Total Points', type: 'number' },
      { key: 'lineoutWins', label: 'Lineout Wins', type: 'number' },
      { key: 'scrumWins', label: 'Scrum Wins', type: 'number' },
    ],
  },
  swimming: {
    code: 'swimming',
    name: 'Swimming',
    positions: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'],
    ratingAttributes: ['Speed', 'Endurance', 'Technique', 'Starts', 'Turns', 'Consistency'],
    playerStatFields: [
      { key: 'event', label: 'Event', type: 'select', options: ['50m Free', '100m Free', '200m Free', '400m Free', '50m Back', '100m Back', '50m Breast', '100m Breast', '50m Fly', '100m Fly', '200m IM', '400m IM'] },
      { key: 'time', label: 'Time', type: 'time', unit: 'seconds' },
      { key: 'placement', label: 'Placement', type: 'number' },
    ],
    teamStatFields: [],
  },
  athletics: {
    code: 'athletics',
    name: 'Athletics',
    positions: ['Sprinter', 'Middle Distance', 'Long Distance', 'Jumper', 'Thrower'],
    ratingAttributes: ['Speed', 'Endurance', 'Power', 'Technique', 'Consistency', 'Mental'],
    playerStatFields: [
      { key: 'event', label: 'Event', type: 'select', options: ['100m', '200m', '400m', '800m', '1500m', '3000m', '110m Hurdles', 'Long Jump', 'High Jump', 'Triple Jump', 'Shot Put', 'Discus', 'Javelin'] },
      { key: 'result', label: 'Result', type: 'number' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['seconds', 'metres'] },
      { key: 'wind', label: 'Wind (m/s)', type: 'number' },
      { key: 'placement', label: 'Placement', type: 'number' },
    ],
    teamStatFields: [],
  },
  hockey: {
    code: 'hockey',
    name: 'Hockey',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    ratingAttributes: ['Attack', 'Defence', 'Skill', 'Speed', 'Fitness', 'Vision'],
    playerStatFields: [
      { key: 'goals', label: 'Goals', type: 'number' },
      { key: 'assists', label: 'Assists', type: 'number' },
      { key: 'penaltyCorners', label: 'Penalty Corners Won', type: 'number' },
      { key: 'greenCards', label: 'Green Cards', type: 'number' },
      { key: 'yellowCards', label: 'Yellow Cards', type: 'number' },
      { key: 'redCards', label: 'Red Cards', type: 'number' },
      { key: 'saves', label: 'Saves (GK)', type: 'number' },
    ],
    teamStatFields: [
      { key: 'penaltyCornerConversions', label: 'PC Conversions', type: 'number' },
      { key: 'shotsOnGoal', label: 'Shots on Goal', type: 'number' },
    ],
  },
  netball: {
    code: 'netball',
    name: 'Netball',
    positions: ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'],
    ratingAttributes: ['Shooting', 'Passing', 'Defence', 'Movement', 'Fitness', 'Game Sense'],
    playerStatFields: [
      { key: 'goals', label: 'Goals', type: 'number' },
      { key: 'goalAttempts', label: 'Goal Attempts', type: 'number' },
      { key: 'interceptions', label: 'Interceptions', type: 'number' },
      { key: 'rebounds', label: 'Rebounds', type: 'number' },
      { key: 'centrePasses', label: 'Centre Passes', type: 'number' },
      { key: 'penalties', label: 'Penalties', type: 'number' },
    ],
    teamStatFields: [
      { key: 'totalGoals', label: 'Total Goals', type: 'number' },
      { key: 'shootingAccuracy', label: 'Shooting Accuracy %', type: 'number' },
    ],
  },
  soccer: {
    code: 'soccer',
    name: 'Soccer',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    ratingAttributes: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defence', 'Physical'],
    playerStatFields: [
      { key: 'goals', label: 'Goals', type: 'number' },
      { key: 'assists', label: 'Assists', type: 'number' },
      { key: 'shotsOnTarget', label: 'Shots on Target', type: 'number' },
      { key: 'yellowCards', label: 'Yellow Cards', type: 'number' },
      { key: 'redCards', label: 'Red Cards', type: 'number' },
      { key: 'saves', label: 'Saves (GK)', type: 'number' },
      { key: 'cleanSheets', label: 'Clean Sheets', type: 'boolean' },
    ],
    teamStatFields: [
      { key: 'corners', label: 'Corners', type: 'number' },
      { key: 'fouls', label: 'Fouls', type: 'number' },
    ],
  },
  tennis: {
    code: 'tennis',
    name: 'Tennis',
    positions: ['Singles', 'Doubles'],
    ratingAttributes: ['Serve', 'Return', 'Forehand', 'Backhand', 'Fitness', 'Mental'],
    playerStatFields: [
      { key: 'aces', label: 'Aces', type: 'number' },
      { key: 'doubleFaults', label: 'Double Faults', type: 'number' },
      { key: 'firstServePercent', label: 'First Serve %', type: 'number' },
      { key: 'winners', label: 'Winners', type: 'number' },
      { key: 'unforcedErrors', label: 'Unforced Errors', type: 'number' },
      { key: 'setsWon', label: 'Sets Won', type: 'number' },
      { key: 'setsLost', label: 'Sets Lost', type: 'number' },
    ],
    teamStatFields: [],
  },
};

export const VALID_SPORT_CODES = Object.keys(SPORT_CONFIGS);
