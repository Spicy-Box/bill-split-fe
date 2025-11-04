import { FlatList } from "react-native";
import ListItem from "../common/ListItem";

export default function EventList() {
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

  return (
    <FlatList
      contentContainerStyle={{
        gap: 20,
      }}
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ListItem
          name={item.name}
          date={item.date}
          price={item.price}
          people={item.people}
        />
      )}
    />
  );
}
