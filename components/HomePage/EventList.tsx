import { FlatList } from "react-native";
import ListItem from "../common/ListItem";
import { useCallback, useEffect, useState } from "react";
import { EventReponse } from "@/interfaces/api/event.api";
import api from "@/utils/api";
import { format } from "date-fns";

export default function EventList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [eventList, setEventList] = useState<EventReponse[]>([]);

  const DATA = [
    {
      id: "1",
      name: "Trip",
      date: "15 Oct, 2025",
      price: 455000,
      people: 6,
    },
    {
      id: "2",
      name: "Trip",
      date: "15 Oct, 2025",
      price: 455000,
      people: 6,
    },
    {
      id: "3",
      name: "Trip",
      date: "15 Oct, 2025",
      price: 455000,
      people: 6,
    },
    {
      id: "4",
      name: "Trip",
      date: "15 Oct, 2025",
      price: 455000,
      people: 6,
    },
  ];

  const fetchEventList = useCallback(async () => {
    const res = await api.get("/events/");
    const data: EventReponse[] = res.data.data;

    console.log(data);
    setEventList(data);
  }, []);

  useEffect(() => {
    fetchEventList();
  }, [fetchEventList]);

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
          date={format(item.createdAt, "dd MMM, yyyy")}
          price={item.totalAmount}
          people={item.participantsCount}
        />
      )}
    />
  );
}
