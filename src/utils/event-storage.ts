import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredParticipant = {
  id: string;
  name: string;
};

export type StoredExpense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
};

export type StoredEvent = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  total: number;
  participants: Array<StoredParticipant | string>;
  expenses: StoredExpense[];
};

export const EVENTS_STORAGE_KEY = 'gdg_split_events';

export async function loadSavedEvents(): Promise<StoredEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredEvent[];

    return Array.isArray(parsed)
      ? parsed.map((event) => ({
          ...event,
          participants: Array.isArray(event.participants)
            ? event.participants.map((participant, index) =>
                typeof participant === 'string'
                  ? { id: participant || `participant-${index}`, name: participant }
                  : participant,
              )
            : [],
        }))
      : [];
  } catch (error) {
    console.error('Failed to load saved events', error);
    return [];
  }
}

export async function saveSavedEvents(events: StoredEvent[]) {
  try {
    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events', error);
  }
}
