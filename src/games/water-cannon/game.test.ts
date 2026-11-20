import { describe, expect, it } from 'vitest';
import {
  CANNON,
  SPEED_MULTIPLIER,
  TANK_SIZE,
  createState,
  fire,
  isHit,
  modeAt,
  modeButton,
  scoreForHit,
  step,
  toggleMinnesota,
  type Target,
} from './game';

const target: Target = { x: 400, y: 200, radius: 28, speed: 120 };

describe('water cannon', () => {
  it('starts with a full tank and no score', () => {
    const state = createState();
    expect(state.tank).toBe(TANK_SIZE);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('playing');
  });

  it('uses one shot of water per fire', () => {
    const state = createState();
    expect(fire(state, 400, 0)).toBe(true);
    expect(state.tank).toBe(TANK_SIZE - 1);
    expect(state.shots).toHaveLength(1);
  });

  it('cannot fire once the tank is empty', () => {
    const state = createState();
    state.tank = 0;
    expect(fire(state, 400, 0)).toBe(false);
    expect(state.shots).toHaveLength(0);
  });

  it('never fires downwards, even when aimed below the cannon', () => {
    const state = createState();
    fire(state, CANNON.x + 100, CANNON.y + 100);
    expect(state.shots[0].vy).toBeLessThan(0);
  });

  it('scores a hit and sends the target back to the start of its rail', () => {
    const state = createState();
    state.targets = [{ ...target }];
    state.shots = [{ x: target.x, y: target.y + 5, vx: 0, vy: 0 }];
    step(state, 0);
    expect(state.score).toBe(scoreForHit(target));
    expect(state.shots).toHaveLength(0);
    expect(state.targets[0].x).toBeLessThan(0);
  });

  it('ends the game when the tank is empty and the last shot has landed', () => {
    const state = createState();
    state.tank = 0;
    state.shots = [{ x: 10, y: -20, vx: 0, vy: -700 }];
    step(state, 0.1);
    expect(state.phase).toBe('over');
  });

  it('keeps playing while a shot is still in the air', () => {
    const state = createState();
    state.targets = [];
    state.tank = 0;
    state.shots = [{ x: 400, y: 300, vx: 0, vy: -700 }];
    step(state, 0.1);
    expect(state.phase).toBe('playing');
  });

  it('detects a hit inside the target and a miss outside it', () => {
    expect(isHit({ x: 410, y: 210, vx: 0, vy: 0 }, target)).toBe(true);
    expect(isHit({ x: 460, y: 200, vx: 0, vy: 0 }, target)).toBe(false);
  });

  it('scores a fast target higher than a slow one', () => {
    const slow = scoreForHit({ ...target, speed: 60 });
    const fast = scoreForHit({ ...target, speed: -180 });
    expect(Math.max(fast, slow)).toBeGreaterThanOrEqual(slow);
  });

  it('keeps the rail speeds on Easy', () => {
    const speeds = createState('easy').targets.map((t) => t.speed);
    expect(new Set(speeds)).toEqual(new Set([180, -120, 60]));
    expect(createState().targets).toEqual(createState('easy').targets);
  });

  it('moves every target twice as fast on Hard, in the same direction', () => {
    expect(SPEED_MULTIPLIER.hard).toBe(2);
    const easy = createState('easy').targets;
    const hard = createState('hard').targets;
    expect(hard).toHaveLength(easy.length);
    hard.forEach((t, i) => {
      expect(t.speed).toBe(easy[i].speed * 2);
      expect(Math.sign(t.speed)).toBe(Math.sign(easy[i].speed));
      expect({ ...t, speed: 0 }).toEqual({ ...easy[i], speed: 0 });
    });
  });

  it('scores the same hit higher on Hard than on Easy', () => {
    const play = (mode: 'easy' | 'hard') => {
      const state = createState(mode);
      const t = state.targets[0];
      state.targets = [t];
      state.shots = [{ x: t.x, y: t.y, vx: 0, vy: 0 }];
      step(state, 0);
      return state.score;
    };
    expect(play('easy')).toBeGreaterThan(0);
    expect(play('hard')).toBeGreaterThan(play('easy'));
  });

  it('finds the mode button under a click, and nothing beside them', () => {
    for (const mode of ['easy', 'hard'] as const) {
      const b = modeButton(mode);
      expect(modeAt(b.x + b.width / 2, b.y + b.height / 2)).toBe(mode);
    }
    expect(modeAt(0, 0)).toBeNull();
  });

  it('starts every new game with Minnesota Mode off', () => {
    expect(createState().minnesota).toBe(false);
    expect(createState('hard').minnesota).toBe(false);
  });

  it('flips Minnesota Mode on and back off', () => {
    const state = createState();
    toggleMinnesota(state);
    expect(state.minnesota).toBe(true);
    toggleMinnesota(state);
    expect(state.minnesota).toBe(false);
  });

  it('scores and moves the same with Minnesota Mode on, in both modes', () => {
    for (const mode of ['easy', 'hard'] as const) {
      const play = (minnesota: boolean) => {
        const state = createState(mode);
        if (minnesota) toggleMinnesota(state);
        for (const t of state.targets.slice(0, 3)) fire(state, t.x, t.y);
        for (let i = 0; i < 60; i++) step(state, 1 / 60);
        return { ...state, minnesota: undefined };
      };
      expect(play(false).score).toBeGreaterThan(0);
      expect(play(true)).toEqual(play(false));
    }
  });

  it('counts the same hits with Minnesota Mode on', () => {
    const state = createState();
    toggleMinnesota(state);
    state.targets = [{ ...target }];
    state.shots = [{ x: target.x, y: target.y + 5, vx: 0, vy: 0 }];
    step(state, 0);
    expect(state.score).toBe(scoreForHit(target));
  });
});
