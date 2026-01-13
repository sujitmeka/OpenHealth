# User Goal Creation with AI Assistance

## Overview

Add ability for users to create custom goals through an AI-powered slide-out chat panel. The AI validates goals against the user's health data (biomarkers, DEXA, Whoop) and helps refine them into actionable targets.

## User Flow

1. User clicks "+Create Goal" button on Goals page
2. Slide-out panel opens from right side
3. User describes their goal in free-form chat
4. AI responds by:
   - Acknowledging the goal
   - Pulling relevant evidence from their health data
   - Validating if it's meaningful for them
   - Suggesting specific, measurable targets
5. AI proposes a goal card preview
6. User confirms → goal saved to JSON file
7. Goal appears alongside auto-generated goals

## UI Design

### Goals Page Changes
- "+Create Goal" button in header (emerald/success color)
- Button only opens panel when clicked

### Slide-out Panel (400-500px wide)
- Header: "Create a Goal" with close (X) button
- Chat area with goal-focused messaging
- Input field: "Describe your goal..."
- Goal preview card appears when AI proposes (with "Add Goal" / "Keep Refining" buttons)

```
┌─────────────────────────────────────┬──────────────────────┐
│  Goals                    +Create   │  Create a Goal    X  │
│  ─────────────────────────────────  │                      │
│  [Auto-generated Goal Cards...]     │  [Chat messages...]  │
│                                     │                      │
│                                     │  ┌─────────────────┐ │
│                                     │  │ [Goal Preview]  │ │
│                                     │  │ Add | Refine    │ │
│                                     │  └─────────────────┘ │
│                                     │  [Type here...]      │
└─────────────────────────────────────┴──────────────────────┘
```

## Data Integration

### Health Context for AI
The goal-creation AI receives:
- Full biomarker summary with status (optimal/normal/out-of-range)
- DEXA body composition data
- Whoop/activity metrics (HRV, sleep, RHR averages)
- Current auto-generated goals (to avoid duplicates)

### Example Conversation
```
User: "I want to get stronger"

AI: "Great goal! Looking at your data, I can help make this specific.

📊 From your DEXA scan:
- Current lean mass: 142 lbs
- Body fat: 18%

💪 Your Whoop shows good recovery (HRV 63ms), which supports
training capacity.

A few questions:
- Are you thinking strength for muscle gain, or functional
  strength for longevity?
- Any specific areas (upper body, core, legs)?"
```

## Data Structure

### User-Created Goal
```typescript
{
  id: "user-goal-1705123456",
  title: "Build functional strength",
  description: "Increase lean mass while maintaining mobility...",
  priority: "medium",
  category: "Fitness",
  actionItems: ["Strength train 3x/week", "Track progressive overload", ...],
  source: "user",  // distinguishes from "auto"
  createdAt: "2026-01-13T..."
}
```

### Storage
- File: `/data/user-goals.json`
- Loaded by HealthDataStore alongside other health data
- Auto-generated goals remain computed on-the-fly
- Goals page shows both: auto-generated + user-created

## Implementation

### New Files

1. **`src/components/goals/CreateGoalPanel.tsx`**
   - Slide-out panel component
   - Contains the goal-focused chat
   - Shows goal preview card when AI proposes

2. **`src/components/goals/GoalChat.tsx`**
   - Chat component specialized for goal creation
   - Emits event when goal is ready to save

3. **`src/lib/agent/goal-agent.ts`**
   - Goal-specific system prompt
   - Function to query AI for goal creation
   - Parses AI response to extract structured goal

4. **`src/app/api/goals/route.ts`**
   - POST endpoint to save user goals
   - Reads/writes `/data/user-goals.json`

5. **Updates to `src/lib/store/health-data.ts`**
   - Load user goals from JSON
   - Merge with auto-generated goals

### Files to Modify

1. `src/app/(main)/goals/page.tsx` - Add +Create button
2. `src/app/(main)/goals/GoalsClient.tsx` - Manage panel state, render panel

## API

### POST /api/goals
Saves a new user-created goal.

**Request:**
```json
{
  "title": "Build functional strength",
  "description": "...",
  "priority": "medium",
  "category": "Fitness",
  "actionItems": ["...", "..."]
}
```

**Response:**
```json
{
  "success": true,
  "goal": { ... }
}
```
