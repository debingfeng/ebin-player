import { type PlayerState } from './types';

type Listener = (state: PlayerState) => void;

export class PlayerStore {
  private state: PlayerState;
  private listeners: Listener[] = [];

  constructor(initialState: PlayerState) {
    this.state = { ...initialState };
  }

  getState() {
    return { ...this.state };
  }

  setState(partial: Partial<PlayerState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}