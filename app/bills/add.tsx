import {
  BillHeader,
  BillItemInput,
  BillItemRow,
  BillTotals,
  PaidByDropdown,
  ParticipantDropdown,
  SplitModeOptions,
  SplitResultList,
  getParticipantId,
  type BillItem,
  type ManualSplit,
  type SplitMode,
  type SplitOption,
} from "@/components/BillCreate";
import { BillCreateRequest } from "@/interfaces/api/bill.api";
import { useEventStore } from "@/stores/useEventStore";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Constants
export const SPLIT_OPTIONS: SplitOption[] = [
  { id: "equally", label: "Equally", icon: "equally" },
  { id: "by_item", label: "By Item", icon: "by-item" },
  { id: "manual", label: "Manually", icon: "manually" },
];

export const TAX_RATE = 5;

export const EVERYONE_OPTION = "everyone";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_CARD_HEIGHT = SCREEN_HEIGHT * 0.9;
const HEADER_SCROLL_THRESHOLD = 50;

export default function CreateBill() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [billName, setBillName] = useState("New Bill");
  const [items, setItems] = useState<BillItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [paidBy, setPaidBy] = useState<string>("me");
  const [splitMode, setSplitMode] = useState<SplitMode>("equally");
  const [taxRate, setTaxRate] = useState<number>(TAX_RATE);
  const [manualSplits, setManualSplits] = useState<ManualSplit[]>([]);
  const [showParticipantDropdown, setShowParticipantDropdown] = useState<string | null>(null);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const participants = useEventStore((state) => state.participants);
  const eventId = useEventStore((state) => state.event_id);

  // Initialize paidBy with the current user's identifier when participants are loaded
  // The current user is the participant who has user_id
  useEffect(() => {
    if (participants.length > 0 && paidBy === "me") {
      const meParticipant = participants.find((p) => p.user_id);
      if (meParticipant) {
        setPaidBy(getParticipantId(meParticipant));
      }
    }
  }, [participants, paidBy]);

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
      const participant = participants?.find((p) => getParticipantId(p) === id);
      return participant
        ? participant.user_id
          ? `${participant.name} (Me)`
          : participant.name
        : id;
    },
    [participants]
  );

  // Get participant display text
  const getParticipantDisplayText = useCallback(
    (itemParticipants: string[]): string => {
      if (
        itemParticipants.includes(EVERYONE_OPTION) ||
        itemParticipants.length === participants?.length
      ) {
        return "Everyone";
      }
      if (itemParticipants.length === 1) {
        return getParticipantName(itemParticipants[0]);
      }
      return `${itemParticipants.length} people`;
    },
    [participants?.length, getParticipantName]
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
          if (newParticipants.length === participants?.length) {
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
        setSplitMode("by_item");
      }
    },
    [items, participants?.length, splitMode]
  );

  // Handle split mode change
  const handleSplitModeChange = useCallback(
    (mode: SplitMode) => {
      setSplitMode(mode);

      if (mode === "equally") {
        // Reset all items to everyone
        setItems((prev) => prev.map((item) => ({ ...item, participants: [EVERYONE_OPTION] })));
      }

      if (mode === "manual") {
        // Initialize manual splits
        const initialSplits: ManualSplit[] = participants.map((p) => {
          const participantId = getParticipantId(p);
          return {
            id: participantId,
            participantId: participantId,
            amount: 0,
          };
        });
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
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const isManualSplitValid = useCallback(() => {
    if (splitMode !== "manual") return true;
    const manualTotal = manualSplits.reduce((sum, split) => sum + split.amount, 0);
    return Math.abs(manualTotal - total) < 0.01;
  }, [splitMode, manualSplits, total]);

  const handleSplitBill = async () => {
    try {
      setLoading(true);

      if (!isManualSplitValid()) {
        setLoading(false);
        Alert.alert(
          "Invalid manual split",
          "The sum of manual shares must equal the total bill amount."
        );
        return;
      }

      const baseRequest = {
        event_id: eventId as string,
        title: billName,
        bill_split_type: splitMode,
        tax: taxRate,
        paid_by: paidBy,
      };

      const createItem = () => {
        if (splitMode === "equally" || splitMode === "manual") {
          return items.map((item) => {
            return {
              name: item.name,
              quantity: item.quantity,
              unit_price: item.unitPrice,
            };
          });
        }

        return items.map((item) => {
          return {
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            split_type:
              item.participants.length === 1 && item.participants[0] === "everyone"
                ? "everyone"
                : "custom",
            split_between:
              item.participants.length === 1 && item.participants[0] === "everyone"
                ? participants
                : participants.filter((participant) => {
                    if (participant.user_id) {
                      return (
                        item.participants.includes(participant.user_id) ||
                        item.participants.includes(participant.name)
                      );
                    }
                    return item.participants.includes(participant.name);
                  }),
          };
        });
      };

      let billCreateRequest: BillCreateRequest;

      if (splitMode === "equally") {
        billCreateRequest = {
          ...baseRequest,
          items: createItem(),
        };
      } else if (splitMode === "by_item") {
        billCreateRequest = {
          ...baseRequest,
          items: createItem(),
        };
      } else {
        billCreateRequest = {
          ...baseRequest,
          items: createItem(),
          manual_shares: manualSplits.map((split) => {
            const participant = participants.find(
              (p) => getParticipantId(p) === split.participantId
            );
            return {
              user_name: participant ?? {
                name: split.participantId,
                is_guest: true,
              },
              amount: split.amount,
            };
          }),
        };
      }

      const response = await api.post("/bills/", billCreateRequest);
      const data = response.data.data;
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Create bill successfully",
      });
      router.push(`/bills/${data.id}`);
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <>
      {loading && (
        <View className="bg-[rgba(0,0,0,0.3)] items-center justify-center absolute z-10 top-0 bottom-0 left-0 right-0">
          <ActivityIndicator size={"large"} color={COLOR.primary3} />
        </View>
      )}

      <SafeAreaView className="flex-1 bg-primary1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <Animated.ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
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
              <BillHeader title={billName} onBack={() => router.back()} setBillName={setBillName} />
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
                      {participants.find((p) => getParticipantId(p) === paidBy)?.user_id
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
              <BillTotals
                subtotal={subtotal}
                tax_rate={taxRate}
                total={total}
                setTaxRate={setTaxRate}
              />

              {/* Split Mode Options */}
              <SplitModeOptions
                selectedMode={splitMode}
                onModeChange={handleSplitModeChange}
                splitOptions={SPLIT_OPTIONS}
              />

              {/* Split Result */}
              <SplitResultList
                mode={splitMode}
                manualSplits={manualSplits}
                participants={participants}
                hasItems={items.length > 0}
                onUpdateManualSplit={updateManualSplit}
                taxRate={TAX_RATE}
              />

              {/* Split Bill Button */}
              <TouchableOpacity
                onPress={handleSplitBill}
                disabled={items.length === 0 && splitMode !== "manual"}
                className={`w-full ${
                  items.length === 0 && splitMode !== "manual" ? "bg-primary2" : "bg-dark1"
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
    </>
  );
}
