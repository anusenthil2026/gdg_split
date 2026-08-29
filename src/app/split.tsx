import { useMemo, useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Participant = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

export default function SplitScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
  ]);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [paidBy, setPaidBy] = useState('1');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([
  ]);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const totalSpent = useMemo(
    () => expenses.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
    [expenses],
  );

  const participantBalances = useMemo(() => {
    const balanceMap = participants.reduce(
      (acc, participant) => {
        acc[participant.id] = { name: participant.name, paid: 0, owes: 0 };
        return acc;
      },
      {} as Record<string, { name: string; paid: number; owes: number }>,
    );

    expenses.forEach((expense) => {
      const splitAmount = expense.participants.length
        ? expense.amount / expense.participants.length
        : 0;

      balanceMap[expense.paidBy].paid += expense.amount;

      expense.participants.forEach((participantId) => {
        balanceMap[participantId].owes += splitAmount;
      });
    });

    return participants.map((participant) => ({
      ...participant,
      paid: balanceMap[participant.id].paid,
      owes: balanceMap[participant.id].owes,
      net: balanceMap[participant.id].paid - balanceMap[participant.id].owes,
    }));
  }, [expenses, participants]);

  const addParticipant = () => {
    const trimmed = participantInput.trim();
    if (!trimmed) {
      return;
    }

    const alreadyExists = participants.some(
      (participant) => participant.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      setParticipantInput('');
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: trimmed,
    };

    setParticipants((current) => [...current, newParticipant]);
    setSelectedParticipants((current) => [...current, newParticipant.id]);
    setPaidBy((current) => current || newParticipant.id);
    setParticipantInput('');
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants((current) =>
      current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId],
    );
  };

  const addExpense = () => {
    const trimmedTitle = expenseTitle.trim();
    const parsedAmount = Number(expenseAmount);
    const validParticipants = selectedParticipants.filter((id) =>
      participants.some((participant) => participant.id === id),
    );

    if (!trimmedTitle || !parsedAmount || validParticipants.length === 0) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: trimmedTitle,
      amount: parsedAmount,
      paidBy,
      participants: validParticipants,
    };

    setExpenses((current) => [newExpense, ...current]);
    setExpenseTitle('');
    setExpenseAmount('');
    setSelectedParticipants(participants.map((participant) => participant.id));
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.headerCard}>
          <ThemedText type="subtitle">Create Event</ThemedText>
          <TextInput
            value={eventName}
            onChangeText={setEventName}
            placeholder="Event name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          <TextInput
            value={eventDescription}
            onChangeText={setEventDescription}
            placeholder="Event description"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
        </ThemedView>

        <ThemedView style={styles.sectionCard}>
          <ThemedText type="smallBold">Participants</ThemedText>
          <View style={styles.inlineInputRow}>
            <TextInput
              value={participantInput}
              onChangeText={setParticipantInput}
              placeholder="Add participant"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                styles.flexInput,
                { backgroundColor: theme.backgroundElement, color: theme.text },
              ]}
            />
            <Pressable onPress={addParticipant} style={styles.primaryButton}>
              <ThemedText type="smallBold" themeColor="text">
                Add
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.tagList}>
            {participants.map((participant) => (
              <View
                key={participant.id}
                style={[styles.tag, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small">{participant.name}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.sectionCard}>
          <ThemedText type="smallBold">Add Expense</ThemedText>

          <TextInput
            value={expenseTitle}
            onChangeText={setExpenseTitle}
            placeholder="Expense title"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />

          <TextInput
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            placeholder="Amount"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />

          <ThemedText type="small" themeColor="textSecondary">
            Who paid?
          </ThemedText>
          <View style={styles.tagList}>
            {participants.map((participant) => (
              <Pressable
                key={participant.id}
                onPress={() => setPaidBy(participant.id)}
                style={[
                  styles.tag,
                  { backgroundColor: paidBy === participant.id ? '#3c87f7' : theme.backgroundElement },
                ]}>
                <ThemedText type="small" themeColor={paidBy === participant.id ? 'text' : 'textSecondary'}>
                  {participant.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            Tag participants to split equally
          </ThemedText>
          <View style={styles.tagList}>
            {participants.map((participant) => {
              const isSelected = selectedParticipants.includes(participant.id);

              return (
                <Pressable
                  key={participant.id}
                  onPress={() => toggleParticipant(participant.id)}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isSelected ? '#3c87f7' : theme.backgroundElement,
                    },
                  ]}>
                  <ThemedText type="small" themeColor={isSelected ? 'text' : 'textSecondary'}>
                    {participant.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={addExpense} style={styles.primaryButton}>
            <ThemedText type="smallBold" themeColor="text">
              Add expense
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.sectionCard}>
          <ThemedText type="smallBold">Event Summary</ThemedText>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            {eventName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {eventDescription || 'No event description'}
          </ThemedText>
          <ThemedText type="smallBold">Total spent: {formatCurrency(totalSpent)}</ThemedText>

          {participantBalances.map((participant) => (
            <View key={participant.id} style={styles.balanceRow}>
              <ThemedText type="smallBold">{participant.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Paid {formatCurrency(participant.paid)} • Owes {formatCurrency(participant.owes)}
              </ThemedText>
              <ThemedText type="small" themeColor={participant.net >= 0 ? 'textSecondary' : 'text'}>
                {participant.net >= 0 ? `Gets back ${formatCurrency(participant.net)}` : `Owes ${formatCurrency(Math.abs(participant.net))}`}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        <ThemedView style={styles.sectionCard}>
          <ThemedText type="smallBold">Expense List</ThemedText>
          {expenses.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No expenses added yet.
            </ThemedText>
          ) : (
            expenses.map((expense) => {
              const splitCount = expense.participants.length || 1;
              const eachShare = expense.amount / splitCount;

              return (
                <View key={expense.id} style={styles.expenseCard}>
                  <ThemedText type="smallBold">{expense.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatCurrency(expense.amount)} • Paid by{' '}
                    {participants.find((participant) => participant.id === expense.paidBy)?.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Split between {expense.participants.length} people • {formatCurrency(eachShare)} each
                  </ThemedText>
                </View>
              );
            })
          )}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  headerCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.25)',
  },
  inlineInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  flexInput: {
    flex: 1,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  primaryButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    marginBottom: -Spacing.one,
  },
  balanceRow: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.25)',
  },
  expenseCard: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    gap: Spacing.one,
  },
});
