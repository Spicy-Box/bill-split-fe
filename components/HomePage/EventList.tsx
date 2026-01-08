import { EventReponse } from "@/interfaces/api/event.api";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { format } from "date-fns";
import { CalendarX2, Edit3, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import EmptyState from "../common/EmptyState";
import ListItem from "../common/ListItem";

type EventListProps = {
  searchQuery?: string;
};

export default function EventList({ searchQuery = "" }: EventListProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventList, setEventList] = useState<EventReponse[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editCurrency, setEditCurrency] = useState<string>("1");
  const [editParticipants, setEditParticipants] = useState<{ name: string }[]>([]);
  const [newParticipantInput, setNewParticipantInput] = useState<string>("");
  const [eventOwnerName, setEventOwnerName] = useState<string>("");
  const [duplicateNames, setDuplicateNames] = useState<Set<string>>(new Set());

  const endpoint = useMemo(() => (searchQuery ? "/events/search" : "/events/"), [searchQuery]);

  // Validate for duplicate participants
  const validateParticipants = useCallback(() => {
    const currentUserName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    const participantNames = editParticipants.map((p) => p.name.trim().toLowerCase());
    const duplicates = new Set<string>();

    // Check for duplicates among participants
    const nameCount = new Map<string, number>();
    participantNames.forEach((name) => {
      const count = (nameCount.get(name) || 0) + 1;
      nameCount.set(name, count);
      if (count > 1) {
        duplicates.add(name);
      }
    });

    // Check if any participant name matches event owner
    if (currentUserName) {
      const ownerNameLower = currentUserName.toLowerCase();
      participantNames.forEach((name) => {
        if (name === ownerNameLower) {
          duplicates.add(name);
        }
      });
    }

    setDuplicateNames(duplicates);
    return duplicates.size === 0;
  }, [editParticipants, user]);

  // Update duplicates whenever participants change
  useEffect(() => {
    validateParticipants();
  }, [editParticipants, validateParticipants]);

  const fetchEventList = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(endpoint, {
        params: searchQuery ? { keyword: searchQuery } : undefined,
      });

      const data = (res.data?.data || []) as unknown[];

      // Fetch summary cho từng event chỉ khi có dữ liệu
      let dataWithSummary = data;
      if (data.length > 0) {
        const summaries = await Promise.allSettled(
          data.map((item: any) =>
            api
              .get(`/bills/events/${item.id}/summary`)
              .then((res) => res.data?.data || { totalAmount: 0 })
          )
        );

        // Update totalAmount từ summary
        dataWithSummary = data.map((item: any, index: number) => {
          const summary = summaries[index];
          const totalAmount =
            summary.status === "fulfilled" && summary.value?.totalAmount
              ? summary.value.totalAmount
              : item.totalAmount || 0;

          return {
            ...item,
            totalAmount,
          };
        });
      }

      const mappedData: EventReponse[] = dataWithSummary.map((item: any) => ({
        id: item.id || "",
        name: item.name || item.eventName || "",
        creator: item.creator || item.creatorId || item.createdBy || "",
        currency: item.currency ?? item.currencyCode ?? 0,
        participantsCount:
          item.participantsCount ?? item.participants_count ?? item.participants?.length ?? 0,
        totalAmount: item.totalAmount ?? item.total_amount ?? 0,
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      }));

      setEventList(mappedData);
    } finally {
      setLoading(false);
    }
  }, [endpoint, searchQuery]);

  useEffect(() => {
    fetchEventList();
  }, [fetchEventList]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEventList();
    setRefreshing(false);
  }, [fetchEventList]);

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      try {
        await api.delete(`/events/${eventId}`);
        await fetchEventList();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Event deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete event:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to delete event. Please try again.",
        });
      }
    },
    [fetchEventList]
  );

  const openEditModal = useCallback(async (event: EventReponse) => {
    setEditingEventId(event.id);
    setShowEditModal(true);

    try {
      const response = await api.get(`/events/${event.id}`);
      const data = response.data.data;

      setEditName(data.name || "");
      setEditCurrency(String(data.currency ?? ""));

      // Find and store event owner's name
      const owner = data.participants?.find((p: any) => p.user_id);
      if (owner && user) {
        const userNameFromStore = `${user.first_name} ${user.last_name}`.trim();
        setEventOwnerName(`${userNameFromStore} (Me)`);
      } else {
        setEventOwnerName("");
      }

      // Convert participants array to array of objects
      // Exclude the event owner (those with user_id) from the editable list
      const participantsList = data.participants
        ? data.participants
            .filter((p: any) => !p.user_id) // Only show guests, not the owner
            .map((p: any) => {
              // If participant has user_id, use the name from userStore
              if (p.user_id && user) {
                const userNameFromStore = `${user.first_name} ${user.last_name}`.trim();
                return { name: userNameFromStore };
              }
              return { name: p.name };
            })
        : [];
      setEditParticipants(participantsList);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load event details",
      });
      // Fallback to basic info if fetch fails
      setEditName(event.name ?? "");
      setEditCurrency(String(event.currency ?? ""));
      setEditParticipants([]);
      setEventOwnerName("");
    }
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingEventId) return;

    const currencyNumber = Number(editCurrency);
    const participantsArray = editParticipants.map((p) => p.name).filter(Boolean);

    try {
      await api.patch(`/events/${editingEventId}`, {
        name: editName,
        currency: Number.isNaN(currencyNumber) ? undefined : currencyNumber,
        participants: participantsArray.length > 0 ? participantsArray : undefined,
      });

      setShowEditModal(false);
      setEditingEventId(null);
      setEditName("");
      setEditCurrency("");
      setEditParticipants([]);
      setNewParticipantInput("");
      setEventOwnerName("");

      await fetchEventList();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Event updated successfully",
      });
      setDuplicateNames(new Set());
    } catch (error) {
      console.error("Failed to update event:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update event. Please try again.",
      });
    }
  }, [editCurrency, editName, editParticipants, editingEventId, fetchEventList]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color={COLOR.primary3} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 20,
          flexGrow: 1,
          paddingBottom: 12,
        }}
        scrollEnabled={true}
        data={eventList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const renderLeftActions = () => (
            <TouchableOpacity
              className="bg-red-500 rounded-xl justify-center items-center px-5 mr-2"
              onPress={() => {
                Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteEvent(item.id),
                  },
                ]);
              }}
            >
              <Trash2 size={24} color="white" />
            </TouchableOpacity>
          );

          const renderRightActions = () => (
            <TouchableOpacity
              className="bg-blue-500 rounded-xl justify-center items-center px-5 ml-2"
              onPress={() => openEditModal(item)}
            >
              <Edit3 size={24} color="white" />
            </TouchableOpacity>
          );

          return (
            <Swipeable
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              overshootLeft={false}
              overshootRight={false}
              friction={2}
              leftThreshold={60}
              rightThreshold={60}
            >
              <ListItem
                id={item.id}
                name={item.name}
                date={format(new Date(item.createdAt), "dd MMM, yyyy")}
                price={item.totalAmount}
                people={item.participantsCount}
              />
            </Swipeable>
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <EmptyState
            icon={CalendarX2}
            title="No events yet"
            description="Create an event to start splitting bills with friends."
            actionLabel="Refresh"
            onActionPress={fetchEventList}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLOR.primary3}
            colors={[COLOR.primary3]}
          />
        }
        // showsHorizontalScrollIndicator={false}
      />

      {/* Edit Event Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <View className="flex-1 bg-black/50 justify-center items-center px-5">
            <View className="bg-light1 rounded-2xl p-6 w-full max-w-md">
            <Text className="text-dark1 text-xl font-bold font-inter mb-4">Edit Event</Text>

            <Text className="text-dark1 text-sm font-medium font-inter mb-2">Name</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-dark1 font-inter"
              value={editName}
              onChangeText={setEditName}
              placeholder="Event name"
            />

            {/* <Text className="text-dark1 text-sm font-medium font-inter mb-2">Currency</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-dark1 font-inter"
              value={editCurrency}
              onChangeText={setEditCurrency}
              placeholder="Currency (number)"
              keyboardType="numeric"
            /> */}

            <Text className="text-dark1 text-sm font-medium font-inter mb-2">Participants</Text>

            {/* Event Owner Badge - Gray */}
            {eventOwnerName && (
              <View className="mb-2">
                <View className="bg-gray-300 rounded-lg px-3 py-2 flex-row items-center self-start">
                  <Text className="text-dark1 font-medium font-inter text-sm">
                    {eventOwnerName}
                  </Text>
                </View>
              </View>
            )}

            {/* Other Participants Badges - Secondary3 */}
            {editParticipants.map((participant, index) => {
              const isDuplicate = duplicateNames.has(participant.name.trim().toLowerCase());
              return (
                <View key={index} className="mb-2">
                  <View
                    className="rounded-lg px-3 py-2 flex-row items-center self-start"
                    style={{ backgroundColor: isDuplicate ? "#fee2e2" : COLOR.secondary3 }}
                  >
                    <Text
                      className="text-sm font-medium font-inter mr-2"
                      style={{ color: isDuplicate ? "#dc2626" : "#1F2937" }}
                    >
                      {participant.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditParticipants(editParticipants.filter((_, i) => i !== index));
                      }}
                    >
                      <Text style={{ color: isDuplicate ? "#dc2626" : "#1F2937" }} className="font-bold text-base">
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {isDuplicate && (
                    <Text className="text-red-600 text-xs font-inter mt-1">
                      Duplicated name or same as event owner
                    </Text>
                  )}
                </View>
              );
            })}

            {/* Add New Participant Input */}
            <View className="flex-row items-center mb-6">
              <TextInput
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-dark1 font-inter mr-2"
                value={newParticipantInput}
                onChangeText={setNewParticipantInput}
                placeholder="Add participant name"
                onSubmitEditing={() => {
                  if (newParticipantInput.trim()) {
                    setEditParticipants([
                      ...editParticipants,
                      { name: newParticipantInput.trim() },
                    ]);
                    setNewParticipantInput("");
                  }
                }}
              />
              <TouchableOpacity
                className="rounded-lg px-4 py-2 items-center justify-center"
                style={{ backgroundColor: COLOR.primary3 }}
                onPress={() => {
                  if (newParticipantInput.trim()) {
                    setEditParticipants([
                      ...editParticipants,
                      { name: newParticipantInput.trim() },
                    ]);
                    setNewParticipantInput("");
                  }
                }}
              >
                <Text className="text-light1 font-bold font-inter text-lg">+</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg py-3 items-center"
                onPress={() => {
                  setShowEditModal(false);
                  setEditingEventId(null);
                  setEditName("");
                  setEditCurrency("");
                  setEditParticipants([]);
                  setNewParticipantInput("");
                  setEventOwnerName("");
                  setDuplicateNames(new Set());
                }}
              >
                <Text className="text-dark1 font-semibold font-inter">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-lg py-3 items-center"
                style={{
                  backgroundColor: duplicateNames.size > 0 ? "#d1d5db" : COLOR.primary3,
                }}
                disabled={duplicateNames.size > 0}
                onPress={handleSaveEdit}
              >
                <Text
                  className="font-semibold font-inter"
                  style={{ color: duplicateNames.size > 0 ? "#6b7280" : "#f5f5f5" }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
