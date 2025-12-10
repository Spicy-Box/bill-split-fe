import { useMemo } from "react";
import { Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import type { AlbumThumb } from "./types";
import { Button } from "react-native-paper";

interface AlbumPickerModalProps {
  visible: boolean;
  albums: MediaLibrary.Album[];
  selectedAlbumId: string | null;
  assets: AlbumThumb[];
  hasNextPage: boolean;
  loadingMore: boolean;
  onClose: () => void;
  onSelectAlbum: (album: MediaLibrary.Album) => void;
  onSelectAsset: (uri: string) => void;
  onLoadMore: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THUMB_GAP = 10;
const H_PADDING = 20 * 2;
const THUMB_SIZE = Math.floor((SCREEN_WIDTH - H_PADDING - THUMB_GAP * 2) / 3);

export const AlbumPickerModal = ({
  visible,
  albums,
  selectedAlbumId,
  assets,
  hasNextPage,
  loadingMore,
  onClose,
  onSelectAlbum,
  onSelectAsset,
  onLoadMore,
}: AlbumPickerModalProps) => {
  const footer = useMemo(() => {
    if (!hasNextPage) return null;
    return (
      <TouchableOpacity
        onPress={onLoadMore}
        disabled={loadingMore}
        style={{ paddingVertical: 14, alignItems: "center" }}
      >
        <Text className="text-primary3 font-semibold">
          {loadingMore ? "Loading..." : "Load more"}
        </Text>
      </TouchableOpacity>
    );
  }, [hasNextPage, loadingMore, onLoadMore]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-dark1/30">
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View className="bg-light1 rounded-t-3xl px-5 pt-6 pb-10" style={{ maxHeight: "85%" }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold text-dark1">Choose album</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary3 font-semibold">Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{ gap: 10 }}
            style={{ height: "8%" }}
            renderItem={({ item }) => <Button>{item.title}</Button>}
          />

          <FlatList
            data={assets}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              rowGap: 10,
            }}
            columnWrapperStyle={{
              justifyContent: "space-between",
              columnGap: THUMB_GAP,
            }}
            renderItem={({ item }) =>
              item.uri ? (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => onSelectAsset(item.uri as string)}
                  style={{
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: "#eee",
                    marginBottom: 10,
                  }}
                >
                  <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%" }} />
                </TouchableOpacity>
              ) : null
            }
            ListFooterComponent={footer}
          />
        </View>
      </View>
    </Modal>
  );
};
