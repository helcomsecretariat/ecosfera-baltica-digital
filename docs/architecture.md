# Architecture Overview

The game is built using several fundamental tools and libraries:

- React Three Fiber - A React renderer for Three.js, used for 3D rendering
- Framer Motion - Animation library for smooth transitions and interactions
- XState - State management library for handling complex game logic and state transitions

## Core Components

### State Management

There are two main components of the game state:

- logical state:
  - where are the cards
  - how many habitats are acquired
  - current turn state (which cards are played, exhausted, etc.)
- UI state:
  - where are the cards on the board
  - how to animate transitions between UI states (animation sequences)

#### Logical State

State management is handled via state machine implemented with XState. The state machine is responsible for:

- turn progression
- card interactions
- game events and disasters
- player actions and abilities
- determining win/loss conditions
- automatic event checks (punishments, auto-turn end, etc.)

#### UI State

UI state is fully derived from the logical state and is calculated every state change. Each time after new UI state is calculated, previous UI state is used to calculate motion data for each game element (angle, distance, start/end position, etc.). Then motion data is used to combine similar motions into few animation sequences. This approach allows to create smooth, natural animations and transitions between UI states. Output of those calculations is data such as start/end points, rotation, duration, delay for each game element. Framer-motion is used then to animate those elements.
