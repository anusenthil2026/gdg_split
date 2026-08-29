import * as Device from 'expo-device';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { type StoredEvent, loadSavedEvents, saveSavedEvents } from '@/utils/event-storage';

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
  const animatedTitleColor = useRef(new Animated.Value(0)).current;

  const fetchEvents = useCallback(async () => {
    const events = await loadSavedEvents();
    setSavedEvents(events);
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    const currentEvents = await loadSavedEvents();
    const updatedEvents = currentEvents.filter((event) => event.id !== eventId);

    await saveSavedEvents(updatedEvents);
    setSavedEvents(updatedEvents);
  }, []);

  const confirmDeleteEvent = useCallback((eventId: string) => {
    Alert.alert('Delete event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEvent(eventId);
        },
      },
    ]);
  }, [deleteEvent]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedTitleColor, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleColor, {
          toValue: 2,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleColor, {
          toValue: 3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleColor, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [animatedTitleColor]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents]),
  );

  const animatedTitleStyle = {
    color: animatedTitleColor.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'],
    }),
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <Image
            source={require('@/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Animated.Text style={[styles.title, animatedTitleStyle]}>
            Welcome to Quick - Split
          </Animated.Text>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
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

                <View style={styles.actionRow}>
                  <Link
                    href={{ pathname: '/split', params: { eventId: event.id } }}
                    asChild>
                    <Pressable style={styles.editButton}>
                      <ThemedText type="smallBold" themeColor="text">
                        Edit event
                      </ThemedText>
                    </Pressable>
                  </Link>

                  <Pressable style={styles.deleteButton} onPress={() => confirmDeleteEvent(event.id)}>
                    <ThemedText type="smallBold" themeColor="text">
                      Delete
                    </ThemedText>
                  </Pressable>
                </View>
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
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
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
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
