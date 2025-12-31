import { EventReponse } from "@/interfaces/api/event.api";
import api from "@/utils/api";
import { COLOR } from "@/utils/color";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import ListItem from "../common/ListItem";

type EventListProps = {
  searchQuery?: string;
};

export default function EventList({ searchQuery = "" }: EventListProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [eventList, setEventList] = useState<EventReponse[]>([]);

  const endpoint = useMemo(() => (searchQuery ? "/events/search" : "/events/"), [searchQuery]);

  const fetchEventList = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(endpoint, {
        params: searchQuery ? { keyword: searchQuery } : undefined,
      });

      const data = (res.data?.data || []) as unknown[];

      const mappedData: EventReponse[] = data.map((item: any) => ({
        id: item.id || item._id || "",
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color={COLOR.primary3} />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{
        gap: 20,
      }}
      data={eventList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ListItem
          id={item.id}
          name={item.name}
          date={format(new Date(item.createdAt), "dd MMM, yyyy")}
          price={item.totalAmount}
          people={item.participantsCount}
        />
      )}
    />
  );
}
