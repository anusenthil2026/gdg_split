import * as Device from 'expo-device';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { type StoredEvent, loadSavedEvents } from '@/utils/event-storage';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const [savedEvents, setSavedEvents] = useState<StoredEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    const events = await loadSavedEvents();
    setSavedEvents(events);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents]),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <Image
            source={require('@/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Quick - Split
          </ThemedText>
        </ThemedView>

        <Link href="/split" asChild>
          <Pressable style={styles.createButton}>
            <ThemedText type="smallBold" themeColor="text">
              + New Event
            </ThemedText>
          </Pressable>
        </Link>

        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {savedEvents.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No saved events yet. Create one to get started.
            </ThemedText>
          ) : (
            savedEvents.map((event) => (
              <ThemedView key={event.id} type="backgroundElement" style={styles.eventCard}>
                <ThemedText type="smallBold">{event.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {event.description || 'No description'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {event.participants.length} participants • Total {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  }).format(event.total)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(event.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </ThemedText>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  logoImage: {
    width: 160,
    height: 160,
    marginTop: 100,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  createButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  eventCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
