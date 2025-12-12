import {
  BillHeader,
  BillItemInput,
  BillItemRow,
  BillTotals,
  PaidByDropdown,
  ParticipantDropdown,
  SplitModeOptions,
  SplitResultList,
  type BillItem,
  type ManualSplit,
  type Participant,
  type SplitMode,
  type SplitOption,
} from "@/components/BillCreate";
import { useEventStore } from "@/stores/useEventStore";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Constants
export const SPLIT_OPTIONS: SplitOption[] = [
  { id: "equally", label: "Equally", icon: "equally" },
  { id: "by-item", label: "By Item", icon: "by-item" },
  { id: "manually", label: "Manually", icon: "manually" },
];

export const TAX_RATE = 0.05;

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "me", name: "Tuấn Anh", isMe: true },
  { id: "2", name: "Khánh Lê" },
  { id: "3", name: "Tú Dương" },
];

export const EVERYONE_OPTION = "everyone";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_CARD_HEIGHT = SCREEN_HEIGHT * 0.9;
const HEADER_SCROLL_THRESHOLD = 50;

export default function CreateBill() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [billName] = useState("Grocery");
  const [items, setItems] = useState<BillItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [paidBy, setPaidBy] = useState<string>("me");
  const [splitMode, setSplitMode] = useState<SplitMode>("equally");
  // const [participants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const participants = useEventStore((state) => state.participants);
  console.log(participants);
  const [manualSplits, setManualSplits] = useState<ManualSplit[]>([]);
  const [showParticipantDropdown, setShowParticipantDropdown] = useState<string | null>(null);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);

  // Animated values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_THRESHOLD],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  // Get participant name by id
  const getParticipantName = useCallback(
    (id: string): string => {
      if (id === EVERYONE_OPTION) return "Everyone";
      const participant = participants.find((p) => p.id === id);
      return participant ? (participant.isMe ? `${participant.name} (Me)` : participant.name) : id;
    },
    [participants]
  );

  // Get participant display text
  const getParticipantDisplayText = useCallback(
    (itemParticipants: string[]): string => {
      if (
        itemParticipants.includes(EVERYONE_OPTION) ||
        itemParticipants.length === participants.length
      ) {
        return "Everyone";
      }
      if (itemParticipants.length === 1) {
        return getParticipantName(itemParticipants[0]);
      }
      return `${itemParticipants.length} people`;
    },
    [participants.length, getParticipantName]
  );

  // Add new item
  const addItem = useCallback(() => {
    const trimmedName = newItemName.trim();
    if (trimmedName) {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: trimmedName,
          unitPrice: 0,
          quantity: 1,
          participants: [EVERYONE_OPTION],
        },
      ]);
      setNewItemName("");
    }
  }, [newItemName]);

  // Update item field
  const updateItem = useCallback(
    (id: string, field: keyof BillItem, value: string | number | string[]) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    },
    []
  );

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }, []);

  // Select participant for an item
  const selectParticipant = useCallback(
    (itemId: string, participantId: string) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;

          if (participantId === EVERYONE_OPTION) {
            return { ...item, participants: [EVERYONE_OPTION] };
          }

          // If currently everyone, switch to this specific person
          if (item.participants.includes(EVERYONE_OPTION)) {
            return { ...item, participants: [participantId] };
          }

          // Toggle this person
          const newParticipants = item.participants.includes(participantId)
            ? item.participants.filter((p) => p !== participantId)
            : [...item.participants, participantId];

          // If all participants selected, switch to everyone
          if (newParticipants.length === participants.length) {
            return { ...item, participants: [EVERYONE_OPTION] };
          }

          // If no one selected, default to everyone
          if (newParticipants.length === 0) {
            return { ...item, participants: [EVERYONE_OPTION] };
          }

          return { ...item, participants: newParticipants };
        })
      );

      // Check if we should switch to by-item mode
      const updatedItems = items.map((item) => {
        if (item.id !== itemId) return item;
        if (participantId === EVERYONE_OPTION) return { ...item, participants: [EVERYONE_OPTION] };
        if (item.participants.includes(EVERYONE_OPTION))
          return { ...item, participants: [participantId] };
        return item;
      });

      const hasNonEveryoneParticipant = updatedItems.some(
        (item) => !item.participants.includes(EVERYONE_OPTION)
      );

      if (hasNonEveryoneParticipant && splitMode === "equally") {
        setSplitMode("by-item");
      }

      // Removed setShowParticipantDropdown(null) to keep dropdown open
      // setShowParticipantDropdown(null);
    },
    [items, participants.length, splitMode]
  );

  // Handle split mode change
  const handleSplitModeChange = useCallback(
    (mode: SplitMode) => {
      setSplitMode(mode);

      if (mode === "equally") {
        // Reset all items to everyone
        setItems((prev) => prev.map((item) => ({ ...item, participants: [EVERYONE_OPTION] })));
      }

      if (mode === "manually") {
        // Initialize manual splits
        const initialSplits: ManualSplit[] = participants.map((p) => ({
          id: p.id,
          participantId: p.id,
          amount: 0,
        }));
        setManualSplits(initialSplits);
      }
    },
    [participants]
  );

  // Update manual split amount
  const updateManualSplit = useCallback((participantId: string, amount: number) => {
    setManualSplits((prev) =>
      prev.map((split) => (split.participantId === participantId ? { ...split, amount } : split))
    );
  }, []);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [items]);

  // Calculate tax and total
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Calculate split amounts for equally mode
  const splitAmounts = useMemo(() => {
    if (splitMode !== "equally" || participants.length === 0) return [];
    const perPerson = total / participants.length;
    return participants.map((p) => ({
      participant: p,
      amount: perPerson,
    }));
  }, [splitMode, total, participants]);

  const handleSplitBill = () => {
    router.push("/bills/detail");
  };

  return (
    <SafeAreaView className="flex-1 bg-primary1" edges={["top"]}>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <Animated.ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
        >
          {/* Header with animation */}
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ scale: headerScale }],
            }}
          >
            <BillHeader title={billName || "New Bill"} onBack={() => router.back()} />
          </Animated.View>

          <View className="bg-light1 rounded-2xl p-4" style={{ minHeight: MIN_CARD_HEIGHT }}>
            {/* Paid By Section */}
            <View className="pb-4 border-b border-dashed border-dark1">
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-dark1 font-medium text-base font-inter">Paid by</Text>
                <TouchableOpacity
                  onPress={() => setShowPaidByDropdown(true)}
                  className="bg-secondary3 rounded px-3 py-1 flex-row items-center gap-1"
                >
                  <Text className="text-dark1 text-sm font-medium font-inter">
                    {participants.find((p) => p.id === paidBy)?.isMe
                      ? "Me"
                      : getParticipantName(paidBy)}
                  </Text>
                  <ChevronDown size={16} color={COLOR.dark1} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bill Items List */}
            {items.length > 0 && (
              <View className="gap-3 mt-4">
                {items.map((item) => (
                  <BillItemRow
                    key={item.id}
                    item={item}
                    participantDisplayText={getParticipantDisplayText(item.participants)}
                    onUpdateName={(text: string) => updateItem(item.id, "name", text)}
                    onUpdateUnitPrice={(price: number) => updateItem(item.id, "unitPrice", price)}
                    onUpdateQuantity={(delta: number) => updateQuantity(item.id, delta)}
                    onRemove={() => removeItem(item.id)}
                    onParticipantPress={() => setShowParticipantDropdown(item.id)}
                    mode={splitMode}
                  />
                ))}
              </View>
            )}

            {/* Create New Item Input */}
            <BillItemInput
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmit={addItem}
              onAdd={addItem}
            />

            {/* Spacer to push content to bottom when empty */}
            <View className="flex-1" />

            {/* Totals Section */}
            <BillTotals subtotal={subtotal} tax_rate={TAX_RATE} total={total} />

            {/* Split Mode Options */}
            <SplitModeOptions
              selectedMode={splitMode}
              onModeChange={handleSplitModeChange}
              splitOptions={SPLIT_OPTIONS}
            />

            {/* Split Result */}
            <SplitResultList
              mode={splitMode}
              splitAmounts={splitAmounts}
              manualSplits={manualSplits}
              participants={participants}
              hasItems={items.length > 0}
              onUpdateManualSplit={updateManualSplit}
              taxRate={TAX_RATE}
            />

            {/* Split Bill Button */}
            <TouchableOpacity
              onPress={handleSplitBill}
              disabled={items.length === 0 && splitMode !== "manually"}
              className={`w-full ${
                items.length === 0 && splitMode !== "manually" ? "bg-primary2" : "bg-dark1"
              } py-4 rounded-full mt-4`}
            >
              <Text className="text-light1 text-center font-semibold font-inter">Split Bill</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>

        {/* Modals */}
        <PaidByDropdown
          visible={showPaidByDropdown}
          selectedId={paidBy}
          participants={participants}
          onClose={() => setShowPaidByDropdown(false)}
          onSelect={setPaidBy}
        />
        {items.map((item) => (
          <ParticipantDropdown
            key={item.id}
            visible={showParticipantDropdown === item.id}
            itemId={item.id}
            items={items}
            participants={participants}
            everyoneOption={EVERYONE_OPTION}
            onClose={() => setShowParticipantDropdown(null)}
            onSelectParticipant={selectParticipant}
          />
        ))}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
